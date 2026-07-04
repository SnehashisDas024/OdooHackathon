import { PrismaClient } from '@prisma/client';
import { success } from '../middleware/errorHandler.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';
import { format, differenceInMinutes } from 'date-fns';

const prisma = new PrismaClient();

const WORK_START_HOUR = 9; // 9 AM
const STANDARD_WORK_HOURS = 8;

// POST /api/v1/attendance/check-in
export async function checkIn(req, res, next) {
  try {
    const employee = await prisma.employee.findFirst({ where: { userId: req.user.userId } });
    if (!employee) throw new NotFoundError('Employee profile not found.');

    const todayDate = new Date(new Date().toDateString()); // midnight

    let record = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: todayDate } }
    });

    if (record && record.checkIn) {
      throw new BadRequestError('You have already checked in today.');
    }

    if (record) {
      record = await prisma.attendance.update({
        where: { id: record.id },
        data: {
          status: 'PRESENT',
          checkIn: new Date(),
        }
      });
    } else {
      record = await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          date: todayDate,
          status: 'PRESENT',
          checkIn: new Date(),
        }
      });
    }

    return success(res, { record }, 'Checked in! Have a great day.');
  } catch (err) { next(err); }
}

// POST /api/v1/attendance/check-out
export async function checkOut(req, res, next) {
  try {
    const employee = await prisma.employee.findFirst({ where: { userId: req.user.userId } });
    if (!employee) throw new NotFoundError();

    const todayDate = new Date(new Date().toDateString());

    const existing = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: todayDate } },
    });

    if (!existing || !existing.checkIn) {
      throw new BadRequestError("You haven't checked in yet today.");
    }

    const checkInTime = existing.checkIn;
    const checkOutTime = new Date();
    const totalMinutes = differenceInMinutes(checkOutTime, checkInTime);
    const totalHours = totalMinutes / 60;
    const breakHours = (existing.breakMinutes || 0) / 60;
    const workHours = Math.max(0, totalHours - breakHours);
    const extraHours = Math.max(0, workHours - STANDARD_WORK_HOURS);

    const record = await prisma.attendance.update({
      where: { employeeId_date: { employeeId: employee.id, date: todayDate } },
      data: {
        checkOut: checkOutTime,
        workHours: parseFloat(workHours.toFixed(2)),
        extraHours: parseFloat(extraHours.toFixed(2)),
      },
    });

    return success(res, { record }, 'Checked out. See you tomorrow!');
  } catch (err) { next(err); }
}

// GET /api/v1/attendance/me?month=YYYY-MM
export async function getMyAttendance(req, res, next) {
  try {
    const employee = await prisma.employee.findFirst({ where: { userId: req.user.userId } });
    if (!employee) throw new NotFoundError();

    const monthParam = req.query.month || format(new Date(), 'yyyy-MM');
    const [year, month] = monthParam.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // last day of month

    const records = await prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    const formatted = records.map((r) => ({
      id: r.id,
      date: format(r.date, 'yyyy-MM-dd'),
      status: r.status.toLowerCase(),
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      workHours: r.workHours,
      extraHours: r.extraHours,
      breakHours: r.breakMinutes ? (r.breakMinutes / 60).toFixed(2) : 0,
    }));

    return success(res, { records: formatted });
  } catch (err) { next(err); }
}

// GET /api/v1/attendance/today — Admin: all employees today
export async function getTodayAttendance(req, res, next) {
  try {
    const todayDate = new Date(new Date().toDateString());

    const employees = await prisma.employee.findMany({
      where: { user: { isActive: true } },
      include: {
        attendanceRecords: {
          where: { date: todayDate },
          take: 1,
        },
        leaveRequests: {
          where: {
            status: 'APPROVED',
            startDate: { lte: todayDate },
            endDate: { gte: todayDate },
          },
          take: 1,
        },
      },
    });

    const records = employees.map((emp) => {
      const att = emp.attendanceRecords?.[0];
      const onLeave = emp.leaveRequests?.length > 0;
      const status = onLeave ? 'leave' : (att?.status?.toLowerCase() || 'absent');
      return {
        id: emp.id,
        employeeName: emp.name,
        status,
        checkIn: att?.checkIn || null,
        checkOut: att?.checkOut || null,
        workHours: att?.workHours || null,
        extraHours: att?.extraHours || null,
      };
    });

    const present = records.filter((r) => r.status === 'present').length;
    const onLeave = records.filter((r) => r.status === 'leave').length;
    const absent = records.filter((r) => r.status === 'absent').length;

    return success(res, { records, summary: { present, onLeave, absent } });
  } catch (err) { next(err); }
}

// GET /api/v1/attendance/:employeeId — Admin
export async function getEmployeeAttendance(req, res, next) {
  try {
    const { employeeId } = req.params;
    const monthParam = req.query.month || format(new Date(), 'yyyy-MM');
    const [year, month] = monthParam.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const records = await prisma.attendance.findMany({
      where: { employeeId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
    });

    return success(res, { records: records.map((r) => ({
      ...r,
      date: format(r.date, 'yyyy-MM-dd'),
      status: r.status.toLowerCase(),
    })) });
  } catch (err) { next(err); }
}

// GET /api/v1/attendance/today-status — Employee: own today status
export async function getTodayStatus(req, res, next) {
  try {
    const employee = await prisma.employee.findFirst({ where: { userId: req.user.userId } });
    if (!employee) throw new NotFoundError();

    const todayDate = new Date(new Date().toDateString());
    const record = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: todayDate } },
    });

    const onLeave = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: employee.id,
        status: 'APPROVED',
        startDate: { lte: todayDate },
        endDate: { gte: todayDate },
      },
    });

    return success(res, {
      record: record ? { ...record, date: format(record.date, 'yyyy-MM-dd'), status: record.status.toLowerCase() } : null,
      onLeave: !!onLeave,
    });
  } catch (err) { next(err); }
}
