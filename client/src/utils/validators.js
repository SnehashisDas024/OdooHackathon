import { z } from 'zod';

export const passwordRules = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/[a-z]/, 'At least one lowercase letter')
  .regex(/[0-9]/, 'At least one number')
  .regex(/[^A-Za-z0-9]/, 'At least one special character');

export const signInSchema = z.object({
  loginId: z.string().min(1, 'Login ID or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    password: passwordRules,
    confirmPassword: z.string(),
    dateOfJoining: z.string().min(1, 'Date of joining is required'),
    role: z.enum(['employee', 'hr'], { required_error: 'Select a role' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    newPassword: passwordRules,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const leaveSchema = z
  .object({
    type: z.enum(['paid', 'sick', 'unpaid'], { required_error: 'Select a leave type' }),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    remarks: z.string().min(3, 'Add a brief remark (min 3 chars)'),
    attachment: z.any().optional(),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  });

export const getPasswordStrength = (password) => {
  const rules = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'One number', test: (p) => /[0-9]/.test(p) },
    { label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];
  return rules.map((r) => ({ ...r, passed: r.test(password || '') }));
};

export const generateLoginId = (firstName, lastName, yearOfJoining, serial) => {
  const first2 = (firstName || '').slice(0, 2).toUpperCase();
  const last2 = (lastName || '').slice(0, 2).toUpperCase();
  const year = String(yearOfJoining).slice(-4);
  const num = String(serial).padStart(4, '0');
  return `OI${first2}${last2}${year}${num}`;
};
