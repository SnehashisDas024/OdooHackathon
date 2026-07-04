import { PrismaClient } from '@prisma/client';
import { success } from '../middleware/errorHandler.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../errors/index.js';
import { differenceInCalendarDays, format } from 'date-fns';

const prisma = new PrismaClient();

// GET /api/v1/leave/balance
export async function getLeaveBalance(req, res, next) {
  try {
    const employee = await prisma.employee.findFirst({ where: { userId: req.user.userId } });
    if (!employee) throw new NotFoundError();

    let balance = await prisma.leaveBalance.findUnique({ where: { employeeId: employee.id } });
    if (!balance) {
      balance = await prisma.leaveBalance.create({ data: { employeeId: employee.id } });
    }

    return success(res, {
      paid: { total: balance.paidTotal, used: balance.paidUsed },
      sick: { total: balance.sickTotal, used: balance.sickUsed },
      unpaid: { used: balance.unpaidUsed },
    });
  } catch (err) { next(err); }
}

// POST /api/v1/leave — Apply for leave
export async function applyLeave(req, res, next) {
  try {
    const employee = await prisma.employee.findFirst({ where: { userId: req.user.userId } });
    if (!employee) throw new NotFoundError();

    const { type, startDate, endDate, remarks } = req.validatedBody;
    const start = new Date(startDate);
    const end = new Date(endDate || startDate);

    if (end < start) throw new BadRequestError('End date must be on or after start date.');

    const daysCount = differenceInCalendarDays(end, start) + 1;

    // Sick leave requires attachment
    if (type === 'SICK' && !req.file) {
      throw new BadRequestError('Sick leave requires a medical certificate. Please attach a file.');
    }

    let attachmentUrl = null;
    if (req.file) {
      const { uploadToCloudinary } = await import('../middleware/upload.js');
      attachmentUrl = await uploadToCloudinary(req.file.buffer, 'hrms/leave-docs', 'auto');
    }

    // Check sufficient balance
    const balance = await prisma.leaveBalance.findUnique({ where: { employeeId: employee.id } });
    if (balance) {
      if (type === 'PAID' && daysCount > (balance.paidTotal - balance.paidUsed)) {
        throw new BadRequestError(`You only have ${balance.paidTotal - balance.paidUsed} paid leave days remaining.`);
      }
      if (type === 'SICK' && daysCount > (balance.sickTotal - balance.sickUsed)) {
        throw new BadRequestError(`You only have ${balance.sickTotal - balance.sickUsed} sick leave days remaining.`);
      }
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        type: type.toUpperCase(),
        startDate: start,
        endDate: end,
        daysCount,
        remarks,
        attachmentUrl,
        status: 'PENDING',
      },
    });

    return success(res, {
      leave: formatLeave(leave, employee.name),
    }, 'Leave request submitted!', 201);
  } catch (err) { next(err); }
}

// GET /api/v1/leave/me
export async function getMyLeaves(req, res, next) {
  try {
    const employee = await prisma.employee.findFirst({ where: { userId: req.user.userId } });
    if (!employee) throw new NotFoundError();

    const leaves = await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' },
    });

    return success(res, { leaves: leaves.map((l) => formatLeave(l, employee.name)) });
  } catch (err) { next(err); }
}

// GET /api/v1/leave — Admin: all requests
export async function getAllLeaves(req, res, next) {
  try {
    const { status, employeeId } = req.query;
    const leaves = await prisma.leaveRequest.findMany({
      where: {
        ...(status ? { status: status.toUpperCase() } : {}),
        ...(employeeId ? { employeeId } : {}),
      },
      include: { employee: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return success(res, { leaves: leaves.map((l) => formatLeave(l, l.employee?.name)) });
  } catch (err) { next(err); }
}

// PATCH /api/v1/leave/:id/decision — Admin: approve or reject
export async function decideLeave(req, res, next) {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.validatedBody;

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!leave) throw new NotFoundError('Leave request not found.');
    if (leave.status !== 'PENDING') {
      throw new BadRequestError('This leave request has already been decided.');
    }

    const updatedStatus = status.toUpperCase();

    await prisma.$transaction(async (tx) => {
      await tx.leaveRequest.update({
        where: { id },
        data: {
          status: updatedStatus,
          adminComment: adminComment || null,
          decidedById: req.user.userId,
        },
      });

      // Deduct balance on approval
      if (updatedStatus === 'APPROVED') {
        const balance = await tx.leaveBalance.findUnique({ where: { employeeId: leave.employeeId } });
        if (balance) {
          if (leave.type === 'PAID') {
            await tx.leaveBalance.update({
              where: { employeeId: leave.employeeId },
              data: { paidUsed: balance.paidUsed + leave.daysCount },
            });
          } else if (leave.type === 'SICK') {
            await tx.leaveBalance.update({
              where: { employeeId: leave.employeeId },
              data: { sickUsed: balance.sickUsed + leave.daysCount },
            });
          } else if (leave.type === 'UNPAID') {
            await tx.leaveBalance.update({
              where: { employeeId: leave.employeeId },
              data: { unpaidUsed: balance.unpaidUsed + leave.daysCount },
            });
          }
        }
      }
    });

    const updated = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: { select: { name: true } } },
    });

    const msg = updatedStatus === 'APPROVED' ? 'Leave approved.' : 'Leave rejected.';
    return success(res, { leave: formatLeave(updated, updated.employee?.name) }, msg);
  } catch (err) { next(err); }
}

function formatLeave(leave, employeeName) {
  return {
    id: leave.id,
    employeeName,
    type: leave.type?.toLowerCase(),
    startDate: leave.startDate ? format(leave.startDate, 'yyyy-MM-dd') : null,
    endDate: leave.endDate ? format(leave.endDate, 'yyyy-MM-dd') : null,
    daysCount: leave.daysCount,
    remarks: leave.remarks,
    attachmentUrl: leave.attachmentUrl,
    status: leave.status?.toLowerCase(),
    adminComment: leave.adminComment,
    createdAt: leave.createdAt,
  };
}
