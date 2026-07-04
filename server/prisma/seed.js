/**
 * Prisma seed — creates 1 Admin + 5 Employees with realistic data.
 * Run: node prisma/seed.js (from server/)
 *
 * Admin credentials:
 *   Login ID: admin@hrms.com   Password: Admin@1234
 *
 * Employee credentials (auto-generated Login IDs, shown in console):
 *   Password for all demo employees: Employee@1234
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@hrms.com';
const ADMIN_PASSWORD = 'Admin@1234';
const EMP_PASSWORD = 'Employee@1234';

function loginIdFor(first, last, year, serial) {
  return `OI${first.slice(0,2).toUpperCase()}${last.slice(0,2).toUpperCase()}${year}${String(serial).padStart(4,'0')}`;
}

function calcSalary(M) {
  const basic = M * 0.5;
  const hra = basic * 0.5;
  const std = 4167;
  const perf = basic * 0.0833;
  const lta = basic * 0.08333;
  const fixed = M - (basic + hra + std + perf + lta);
  const pf = basic * 0.12;
  const pt = 200;
  const net = M - pf - pt;
  return { monthlyWage: M, basicSalary: r(basic), hra: r(hra), standardAllowance: r(std),
    performanceBonus: r(perf), lta: r(lta), fixedAllowance: r(fixed),
    pfContribution: r(pf), professionalTax: r(pt), netPayable: r(net) };
}
function r(n) { return Math.round(n * 100) / 100; }

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log('🌱 Seeding database...');

  // ── Clean up existing data (for re-seeding) ──────────────
  await prisma.attendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // ── Company ──────────────────────────────────────────────
  await prisma.company.create({ data: { name: 'Odoo India Pvt. Ltd.' } });

  // ── Admin ────────────────────────────────────────────────
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await prisma.user.create({
    data: {
      loginId: 'OIADMI20220001',
      email: ADMIN_EMAIL,
      passwordHash: adminHash,
      role: 'ADMIN',
      mustChangePassword: false,
      employee: {
        create: {
          name: 'Admin HR',
          employeeCode: 'OIADMI20220001',
          department: 'Human Resources',
          jobPosition: 'HR Officer',
          dateOfJoining: new Date('2022-01-10'),
          company: 'Odoo India Pvt. Ltd.',
          location: 'Bangalore',
          leaveBalance: { create: {} },
          payroll: { create: calcSalary(90000) },
        },
      },
    },
  });
  console.log(`✅ Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  // ── Employee definitions ─────────────────────────────────
  const employees = [
    { first: 'Arjun',    last: 'Sharma',  dept: 'Engineering',  job: 'Software Engineer',     wage: 75000, year: 2022, serial: 1 },
    { first: 'Priya',    last: 'Patel',   dept: 'Design',       job: 'UI/UX Designer',        wage: 65000, year: 2022, serial: 2 },
    { first: 'Rahul',    last: 'Gupta',   dept: 'Engineering',  job: 'Backend Developer',     wage: 80000, year: 2023, serial: 1 },
    { first: 'Sneha',    last: 'Reddy',   dept: 'Marketing',    job: 'Marketing Executive',   wage: 55000, year: 2023, serial: 2 },
    { first: 'Vikram',   last: 'Singh',   dept: 'Sales',        job: 'Sales Manager',         wage: 70000, year: 2024, serial: 1 },
  ];

  const empHash = await bcrypt.hash(EMP_PASSWORD, 12);
  const today = new Date(new Date().toDateString());

  for (const [i, emp] of employees.entries()) {
    const loginId = loginIdFor(emp.first, emp.last, emp.year, emp.serial);
    const email = `${emp.first.toLowerCase()}.${emp.last.toLowerCase()}@hrms.com`;

    const user = await prisma.user.create({
      data: {
        loginId,
        email,
        passwordHash: empHash,
        role: 'EMPLOYEE',
        mustChangePassword: false,
        employee: {
          create: {
            name: `${emp.first} ${emp.last}`,
            employeeCode: loginId,
            department: emp.dept,
            jobPosition: emp.job,
            dateOfJoining: new Date(`${emp.year}-03-15`),
            company: 'Odoo India Pvt. Ltd.',
            location: 'Bangalore',
            mobile: `98765${String(43210 + i).padStart(5, '0')}`,
            aboutMe: `Passionate ${emp.job} with ${2025 - emp.year}+ years of experience.`,
            gender: i % 2 === 0 ? 'Male' : 'Female',
            nationality: 'Indian',
            maritalStatus: i < 2 ? 'Single' : 'Married',
            bankName: 'HDFC Bank',
            bankAccountNumber: `XXXX${String(1000 + i)}`,
            ifscCode: 'HDFC0001234',
            leaveBalance: {
              create: {
                paidUsed: i,
                sickUsed: i > 2 ? 1 : 0,
              },
            },
            payroll: { create: calcSalary(emp.wage) },
            skills: {
              create: [
                { name: emp.dept === 'Engineering' ? 'Node.js' : emp.dept === 'Design' ? 'Figma' : 'Communication' },
                { name: emp.dept === 'Engineering' ? 'React' : emp.dept === 'Design' ? 'Adobe XD' : 'Leadership' },
              ],
            },
          },
        },
      },
      include: { employee: true },
    });

    const employeeId = user.employee.id;

    // ── Attendance for last 30 days ─────────────────────────
    for (let d = 29; d >= 0; d--) {
      const date = daysAgo(d);
      const day = date.getDay();
      if (day === 0 || day === 6) continue; // skip weekends

      // Today: only check in if it's a workday
      if (d === 0) {
        if (i < 4) { // 4 of 5 are present today
          await prisma.attendance.create({
            data: {
              employeeId,
              date,
              status: 'PRESENT',
              checkIn: new Date(date.getTime() + 9 * 3600000), // 9 AM
            },
          });
        }
        continue;
      }

      const isAbsent = d === 5 && i === 0; // one historical absent
      await prisma.attendance.create({
        data: {
          employeeId,
          date,
          status: isAbsent ? 'ABSENT' : 'PRESENT',
          checkIn: isAbsent ? null : new Date(date.getTime() + (9 + (i % 2 === 0 ? 0 : 0.5)) * 3600000),
          checkOut: isAbsent ? null : new Date(date.getTime() + (18 + (i % 3) * 0.5) * 3600000),
          workHours: isAbsent ? null : 8 + (i % 2),
          extraHours: isAbsent ? null : (i % 2 === 0 ? 1 : 0),
        },
      });
    }

    // ── Leave requests ──────────────────────────────────────
    if (i === 0) {
      // One approved past leave
      await prisma.leaveRequest.create({
        data: {
          employeeId,
          type: 'PAID',
          startDate: daysAgo(14),
          endDate: daysAgo(13),
          daysCount: 2,
          remarks: 'Family function',
          status: 'APPROVED',
          adminComment: 'Approved. Enjoy!',
        },
      });
    }
    if (i === 1) {
      // One pending leave
      await prisma.leaveRequest.create({
        data: {
          employeeId,
          type: 'SICK',
          startDate: daysAgo(3),
          endDate: daysAgo(2),
          daysCount: 2,
          remarks: 'Fever and cold',
          status: 'PENDING',
        },
      });
    }
    if (i === 2) {
      // One rejected leave
      await prisma.leaveRequest.create({
        data: {
          employeeId,
          type: 'PAID',
          startDate: daysAgo(7),
          endDate: daysAgo(6),
          daysCount: 2,
          remarks: 'Personal work',
          status: 'REJECTED',
          adminComment: 'Project deadline clash — please reschedule.',
        },
      });
    }

    console.log(`✅ Employee: ${emp.first} ${emp.last} | ${loginId} | ${email} / ${EMP_PASSWORD}`);
  }

  console.log('\n🎉 Seed complete! Demo accounts:');
  console.log('──────────────────────────────────────────────────');
  console.log(`👑 ADMIN   : ${ADMIN_EMAIL}    Password: ${ADMIN_PASSWORD}`);
  console.log(`👤 EMPLOYEE: arjun.sharma@hrms.com   Password: ${EMP_PASSWORD}`);
  console.log(`👤 EMPLOYEE: priya.patel@hrms.com    Password: ${EMP_PASSWORD}`);
  console.log(`👤 EMPLOYEE: rahul.gupta@hrms.com    Password: ${EMP_PASSWORD}`);
  console.log('──────────────────────────────────────────────────');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
