import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { success } from '../middleware/errorHandler.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../errors/index.js';
import { generateLoginId, generateEmployeeCode } from '../utils/loginId.js';
import { generateTempPassword } from '../utils/tempPassword.js';
import { calculateSalaryComponents } from '../utils/salaryCalc.js';
import { sendWelcomeEmail } from '../utils/sendEmail.js';
import { uploadToCloudinary } from '../middleware/upload.js';

const prisma = new PrismaClient();

// ── Helper: format employee for API response ───────────────
function formatEmployee(emp) {
  return {
    id: emp.id,
    userId: emp.userId,
    name: emp.name,
    email: emp.user?.email,
    loginId: emp.user?.loginId,
    role: emp.user?.role,
    empCode: emp.employeeCode,
    profilePictureUrl: emp.profilePictureUrl,
    phone: emp.mobile || emp.user?.phone,
    department: emp.department,
    jobTitle: emp.jobPosition,
    managerId: emp.managerId,
    company: emp.company,
    location: emp.location,
    dateOfJoining: emp.dateOfJoining,
    about: emp.aboutMe,
    whatILove: emp.whatILoveAboutJob,
    interests: emp.interestsHobbies,
    resumeUrl: emp.resumeUrl,
    skills: emp.skills?.map((s) => s.name) || [],
    certifications: emp.certifications || [],
    // Private
    dateOfBirth: emp.dateOfBirth,
    address: emp.residingAddress,
    personalEmail: emp.personalEmail,
    gender: emp.gender,
    nationality: emp.nationality,
    maritalStatus: emp.maritalStatus,
    panNo: emp.panNo,
    uanNo: emp.uanNo,
    // Bank
    bankAccountNumber: emp.bankAccountNumber,
    bankName: emp.bankName,
    ifscCode: emp.ifscCode,
  };
}

const EMPLOYEE_INCLUDE = {
  user: { select: { email: true, loginId: true, role: true, phone: true } },
  skills: true,
  certifications: true,
};

// POST /api/v1/employees — Admin: create new employee
export async function createEmployee(req, res, next) {
  try {
    const { name, email, phone, password, department, jobPosition, dateOfJoining, managerId, company, location, role = 'EMPLOYEE' } = req.validatedBody;

    // Check email not already used
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictError('An account with that email already exists.');

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    const joiningYear = new Date(dateOfJoining).getFullYear();

    // Generate credentials inside transaction to avoid race conditions on serial
    const result = await prisma.$transaction(async (tx) => {
      const loginId = await generateLoginId(tx, firstName, lastName, joiningYear);
      const employeeCode = generateEmployeeCode(loginId);
      const tempPassword = password || generateTempPassword();
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      const user = await tx.user.create({
        data: {
          loginId,
          email,
          phone,
          passwordHash,
          role: role.toUpperCase(),
          mustChangePassword: !password, // if admin set a password, don't force change
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          name,
          department,
          jobPosition,
          dateOfJoining: new Date(dateOfJoining),
          managerId: managerId || null,
          company: company || 'Odoo India',
          location,
          employeeCode,
        },
        include: EMPLOYEE_INCLUDE,
      });

      // Create default leave balance
      await tx.leaveBalance.create({ data: { employeeId: employee.id } });

      // Create default payroll (wage = 0 until admin sets it)
      const payrollComponents = calculateSalaryComponents(0);
      await tx.payroll.create({
        data: {
          employeeId: employee.id,
          monthlyWage: 0,
          basicSalary: 0,
          hra: 0,
          standardAllowance: 0,
          performanceBonus: 0,
          lta: 0,
          fixedAllowance: 0,
          pfContribution: 0,
          professionalTax: 0,
          netPayable: 0,
        },
      });

      return { user, employee, tempPassword, loginId };
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail({
      to: email,
      name,
      loginId: result.loginId,
      tempPassword: result.tempPassword,
    }).catch(console.error);

    return success(
      res,
      {
        employee: formatEmployee({ ...result.employee, user: { email, loginId: result.loginId, role: role.toUpperCase(), phone } }),
        loginId: result.loginId,
        temporaryPassword: result.tempPassword,
      },
      'Employee account created.',
      201
    );
  } catch (err) { next(err); }
}

// GET /api/v1/employees — Admin: list all
export async function listEmployees(req, res, next) {
  try {
    const { search, department, status } = req.query;

    const employees = await prisma.employee.findMany({
      where: {
        ...(department ? { department } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { department: { contains: search, mode: 'insensitive' } },
            { jobPosition: { contains: search, mode: 'insensitive' } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ],
        } : {}),
        user: { isActive: true },
      },
      include: {
        ...EMPLOYEE_INCLUDE,
        attendanceRecords: {
          where: { date: new Date(new Date().toDateString()) },
          take: 1,
        },
        leaveRequests: {
          where: {
            status: 'APPROVED',
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = employees.map((emp) => {
      const todayAtt = emp.attendanceRecords?.[0];
      const onLeave = emp.leaveRequests?.length > 0;
      const todayStatus = onLeave ? 'leave' : (todayAtt?.status?.toLowerCase() || 'absent');

      return {
        ...formatEmployee(emp),
        todayStatus,
      };
    });

    return success(res, { employees: formatted });
  } catch (err) { next(err); }
}

// GET /api/v1/employees/me — Own profile
export async function getMyProfile(req, res, next) {
  try {
    const employee = await prisma.employee.findFirst({
      where: { userId: req.user.userId },
      include: EMPLOYEE_INCLUDE,
    });
    if (!employee) throw new NotFoundError('Employee profile not found.');
    return success(res, { employee: formatEmployee(employee) });
  } catch (err) { next(err); }
}

// GET /api/v1/employees/:id — Admin: any employee
export async function getEmployee(req, res, next) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: EMPLOYEE_INCLUDE,
    });
    if (!employee) throw new NotFoundError('Employee not found.');
    return success(res, { employee: formatEmployee(employee) });
  } catch (err) { next(err); }
}

// PATCH /api/v1/employees/me — Employee: update own editable fields
export async function updateMyProfile(req, res, next) {
  try {
    const employee = await prisma.employee.findFirst({ where: { userId: req.user.userId } });
    if (!employee) throw new NotFoundError();

    const ALLOWED = ['mobile', 'residingAddress', 'personalEmail', 'aboutMe', 'whatILoveAboutJob', 'interestsHobbies'];
    const updates = {};
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const forbidden = Object.keys(req.body).filter((k) => !ALLOWED.includes(k) && k !== 'skills');
    if (forbidden.length > 0) throw new ForbiddenError(`You can't edit these fields: ${forbidden.join(', ')}.`);

    const updated = await prisma.employee.update({
      where: { id: employee.id },
      data: updates,
      include: EMPLOYEE_INCLUDE,
    });

    return success(res, { employee: formatEmployee(updated) }, 'Profile updated.');
  } catch (err) { next(err); }
}

// PATCH /api/v1/employees/:id — Admin: update any field
export async function updateEmployee(req, res, next) {
  try {
    const employee = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!employee) throw new NotFoundError('Employee not found.');

    const { name, department, jobPosition, managerId, company, location, dateOfJoining, mobile,
      residingAddress, personalEmail, gender, nationality, maritalStatus, panNo, uanNo,
      bankAccountNumber, bankName, ifscCode, aboutMe, whatILoveAboutJob, interestsHobbies,
      dateOfBirth } = req.body;

    const updated = await prisma.employee.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(department !== undefined && { department }),
        ...(jobPosition !== undefined && { jobPosition }),
        ...(managerId !== undefined && { managerId }),
        ...(company !== undefined && { company }),
        ...(location !== undefined && { location }),
        ...(dateOfJoining !== undefined && { dateOfJoining: new Date(dateOfJoining) }),
        ...(mobile !== undefined && { mobile }),
        ...(residingAddress !== undefined && { residingAddress }),
        ...(personalEmail !== undefined && { personalEmail }),
        ...(gender !== undefined && { gender }),
        ...(nationality !== undefined && { nationality }),
        ...(maritalStatus !== undefined && { maritalStatus }),
        ...(panNo !== undefined && { panNo }),
        ...(uanNo !== undefined && { uanNo }),
        ...(bankAccountNumber !== undefined && { bankAccountNumber }),
        ...(bankName !== undefined && { bankName }),
        ...(ifscCode !== undefined && { ifscCode }),
        ...(aboutMe !== undefined && { aboutMe }),
        ...(whatILoveAboutJob !== undefined && { whatILoveAboutJob }),
        ...(interestsHobbies !== undefined && { interestsHobbies }),
        ...(dateOfBirth !== undefined && { dateOfBirth: new Date(dateOfBirth) }),
      },
      include: EMPLOYEE_INCLUDE,
    });

    return success(res, { employee: formatEmployee(updated) }, 'Employee updated.');
  } catch (err) { next(err); }
}

// POST /api/v1/employees/:id/documents/profile-picture
export async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) throw new BadRequestError('No file uploaded.');
    const employee = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!employee) throw new NotFoundError();

    const url = await uploadToCloudinary(req.file.buffer, 'hrms/avatars', 'image');
    await prisma.employee.update({ where: { id: employee.id }, data: { profilePictureUrl: url } });

    return success(res, { profilePictureUrl: url }, 'Profile picture updated.');
  } catch (err) { next(err); }
}

// Skills
export async function addSkill(req, res, next) {
  try {
    const { name } = req.body;
    const skill = await prisma.skill.create({ data: { employeeId: req.params.id, name } });
    return success(res, { skill }, 'Skill added.', 201);
  } catch (err) { next(err); }
}

export async function removeSkill(req, res, next) {
  try {
    await prisma.skill.delete({ where: { id: req.params.skillId } });
    return success(res, {}, 'Skill removed.');
  } catch (err) { next(err); }
}

// Certifications
export async function addCertification(req, res, next) {
  try {
    const cert = await prisma.certification.create({ data: { employeeId: req.params.id, ...req.body } });
    return success(res, { cert }, 'Certification added.', 201);
  } catch (err) { next(err); }
}

export async function removeCertification(req, res, next) {
  try {
    await prisma.certification.delete({ where: { id: req.params.certId } });
    return success(res, {}, 'Certification removed.');
  } catch (err) { next(err); }
}
