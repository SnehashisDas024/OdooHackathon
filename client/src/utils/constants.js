// ── API Endpoints ──────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Leave Types
export const LEAVE_TYPES = [
  { value: 'paid', label: 'Paid Time Off', days: 24, color: 'var(--brand-primary)' },
  { value: 'sick', label: 'Sick Leave', days: 7, color: 'var(--status-pending)' },
  { value: 'unpaid', label: 'Unpaid Leave', days: null, color: 'var(--ink-muted)' },
];

// Leave Status
export const LEAVE_STATUS = {
  pending: { label: 'Pending', className: 'badge--pending' },
  approved: { label: 'Approved', className: 'badge--approved' },
  rejected: { label: 'Rejected', className: 'badge--rejected' },
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  present: { label: 'Present', className: 'badge--present' },
  absent: { label: 'Absent', className: 'badge--absent' },
  leave: { label: 'On Leave', className: 'badge--leave' },
  halfday: { label: 'Half Day', className: 'badge--pending' },
};

// Roles
export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  EMPLOYEE: 'employee',
};

// Salary formula
export const SALARY_FORMULAS = {
  basic: { label: 'Basic Salary', formula: (wage) => wage * 0.5, desc: '50% of Monthly Wage' },
  hra: { label: 'House Rent Allowance', formula: (wage) => wage * 0.25, desc: '50% of Basic Salary' },
  standardAllowance: { label: 'Standard Allowance', formula: () => 4167, desc: '₹4,167 (fixed)' },
  performanceBonus: { label: 'Performance Bonus', formula: (wage) => wage * 0.5 * 0.0833, desc: '8.33% of Basic Salary' },
  lta: { label: 'Leave Travel Allowance', formula: (wage) => wage * 0.5 * 0.08333, desc: '8.333% of Basic Salary' },
  pfContribution: { label: 'PF Contribution', formula: (wage) => wage * 0.5 * 0.12, desc: '12% of Basic Salary', isDeduction: true },
  professionalTax: { label: 'Professional Tax', formula: () => 200, desc: '₹200 (fixed deduction)', isDeduction: true },
};

export const calculateSalaryComponents = (monthlyWage) => {
  const wage = parseFloat(monthlyWage) || 0;
  const basic = wage * 0.5;
  const hra = basic * 0.5;
  const standardAllowance = 4167;
  const performanceBonus = basic * 0.0833;
  const lta = basic * 0.08333;
  const pfContribution = basic * 0.12;
  const professionalTax = 200;
  const allComponents = basic + hra + standardAllowance + performanceBonus + lta;
  const fixedAllowance = Math.max(0, wage - allComponents);
  const grossSalary = wage;
  const totalDeductions = pfContribution + professionalTax;
  const netPayable = grossSalary - totalDeductions;

  return {
    basic,
    hra,
    standardAllowance,
    performanceBonus,
    lta,
    fixedAllowance,
    pfContribution,
    professionalTax,
    grossSalary,
    totalDeductions,
    netPayable,
  };
};

// Nav items
export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/employees', label: 'Employees', icon: 'Users', adminOnly: true },
  { path: '/attendance', label: 'Attendance', icon: 'Clock' },
  { path: '/leave', label: 'Time Off', icon: 'PlaneTakeoff' },
  { path: '/payroll', label: 'Payroll', icon: 'Wallet', adminOnly: true },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
];
