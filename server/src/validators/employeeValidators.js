import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().optional(),
  password: z.string().optional(), // admin can set a known password; if absent, temp is generated
  department: z.string().optional(),
  jobPosition: z.string().optional(),
  dateOfJoining: z.string().min(1, 'Date of joining is required.'),
  managerId: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  role: z.enum(['EMPLOYEE', 'ADMIN']).default('EMPLOYEE'),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(2).optional(),
  mobile: z.string().optional(),
  department: z.string().optional(),
  jobPosition: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  dateOfJoining: z.string().optional(),
  managerId: z.string().optional(),
  aboutMe: z.string().optional(),
  whatILoveAboutJob: z.string().optional(),
  interestsHobbies: z.string().optional(),
  residingAddress: z.string().optional(),
  personalEmail: z.string().email().optional().or(z.literal('')),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  maritalStatus: z.string().optional(),
  panNo: z.string().optional(),
  uanNo: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  ifscCode: z.string().optional(),
  dateOfBirth: z.string().optional(),
}).strict().passthrough();
