import { z } from 'zod';

export const applyLeaveSchema = z.object({
  type: z.enum(['PAID', 'SICK', 'UNPAID'], { errorMap: () => ({ message: 'Leave type must be PAID, SICK, or UNPAID.' }) }),
  startDate: z.string().min(1, 'Start date is required.'),
  endDate: z.string().optional(),
  remarks: z.string().min(1, 'Remarks are required.'),
});

export const leaveDecisionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'], { errorMap: () => ({ message: 'Status must be APPROVED or REJECTED.' }) }),
  adminComment: z.string().optional(),
});
