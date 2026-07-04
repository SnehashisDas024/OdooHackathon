import { z } from 'zod';

export const updatePayrollSchema = z.object({
  monthlyWage: z
    .number({ invalid_type_error: 'Monthly wage must be a number.' })
    .positive('Monthly wage must be a positive number.'),
});
