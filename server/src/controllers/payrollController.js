import { PrismaClient } from '@prisma/client';
import { success } from '../middleware/errorHandler.js';
import { NotFoundError, ForbiddenError } from '../errors/index.js';
import { calculateSalaryComponents } from '../utils/salaryCalc.js';

const prisma = new PrismaClient();

function formatPayroll(p) {
  if (!p) return null;
  return {
    id: p.id,
    employeeId: p.employeeId,
    monthlyWage: parseFloat(p.monthlyWage),
    basicSalary: parseFloat(p.basicSalary),
    hra: parseFloat(p.hra),
    standardAllowance: parseFloat(p.standardAllowance),
    performanceBonus: parseFloat(p.performanceBonus),
    lta: parseFloat(p.lta),
    fixedAllowance: parseFloat(p.fixedAllowance),
    pfContribution: parseFloat(p.pfContribution),
    professionalTax: parseFloat(p.professionalTax),
    netPayable: parseFloat(p.netPayable),
    updatedAt: p.updatedAt,
  };
}

// GET /api/v1/payroll/me
export async function getMyPayroll(req, res, next) {
  try {
    const employee = await prisma.employee.findFirst({ where: { userId: req.user.userId } });
    if (!employee) throw new NotFoundError('Employee profile not found.');

    const payroll = await prisma.payroll.findUnique({ where: { employeeId: employee.id } });
    return success(res, { payroll: formatPayroll(payroll) });
  } catch (err) { next(err); }
}

// GET /api/v1/payroll/:employeeId — Admin
export async function getEmployeePayroll(req, res, next) {
  try {
    const payroll = await prisma.payroll.findUnique({ where: { employeeId: req.params.employeeId } });
    if (!payroll) throw new NotFoundError('Payroll record not found for this employee.');
    return success(res, { payroll: formatPayroll(payroll) });
  } catch (err) { next(err); }
}

// PUT /api/v1/payroll/:employeeId — Admin: update salary
export async function updatePayroll(req, res, next) {
  try {
    const { monthlyWage } = req.validatedBody;
    const { employeeId } = req.params;

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundError('Employee not found.');

    const components = calculateSalaryComponents(monthlyWage);

    const payroll = await prisma.payroll.upsert({
      where: { employeeId },
      create: {
        employeeId,
        monthlyWage: components.monthlyWage,
        basicSalary: components.basicSalary,
        hra: components.hra,
        standardAllowance: components.standardAllowance,
        performanceBonus: components.performanceBonus,
        lta: components.lta,
        fixedAllowance: components.fixedAllowance,
        pfContribution: components.pfContribution,
        professionalTax: components.professionalTax,
        netPayable: components.netPayable,
      },
      update: {
        monthlyWage: components.monthlyWage,
        basicSalary: components.basicSalary,
        hra: components.hra,
        standardAllowance: components.standardAllowance,
        performanceBonus: components.performanceBonus,
        lta: components.lta,
        fixedAllowance: components.fixedAllowance,
        pfContribution: components.pfContribution,
        professionalTax: components.professionalTax,
        netPayable: components.netPayable,
      },
    });

    return success(res, { payroll: formatPayroll(payroll) }, 'Salary structure updated.');
  } catch (err) { next(err); }
}
