import { PrismaClient } from '@prisma/client';

/**
 * Generates a Login ID in format: OI + XX + XX + YYYY + 0001
 * Example: OIJODO20220001
 */
export async function generateLoginId(prisma, firstName, lastName, yearOfJoining) {
  const first2 = (firstName || '').slice(0, 2).toUpperCase().padEnd(2, 'X');
  const last2 = (lastName || '').slice(0, 2).toUpperCase().padEnd(2, 'X');
  const year = String(yearOfJoining).slice(-4);
  const prefix = `OI${first2}${last2}${year}`;

  // Find highest existing serial for this prefix
  const existing = await prisma.user.findMany({
    where: { loginId: { startsWith: prefix } },
    select: { loginId: true },
  });

  let maxSerial = 0;
  for (const u of existing) {
    const serial = parseInt(u.loginId.slice(prefix.length), 10);
    if (!isNaN(serial) && serial > maxSerial) maxSerial = serial;
  }

  const nextSerial = String(maxSerial + 1).padStart(4, '0');
  return `${prefix}${nextSerial}`;
}

/**
 * Generates a unique employee code (same as loginId by default, but kept separate)
 */
export function generateEmployeeCode(loginId) {
  return loginId;
}
