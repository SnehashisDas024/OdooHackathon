import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { success } from '../middleware/errorHandler.js';
import { UnauthorizedError, NotFoundError, BadRequestError, ConflictError } from '../errors/index.js';
import { generateLoginId, generateEmployeeCode } from '../utils/loginId.js';
import { generateTempPassword } from '../utils/tempPassword.js';
import { calculateSalaryComponents } from '../utils/salaryCalc.js';
import { sendWelcomeEmail } from '../utils/sendEmail.js';

const prisma = new PrismaClient();

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  domain: process.env.COOKIE_DOMAIN || 'localhost',
};

function signTokens(userId, role) {
  const accessToken = jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

function setTokenCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

function clearTokenCookies(res) {
  res.clearCookie('accessToken', COOKIE_OPTS);
  res.clearCookie('refreshToken', COOKIE_OPTS);
}

// POST /api/v1/auth/sign-in
export async function signIn(req, res, next) {
  try {
    const { loginId: loginIdOrEmail, password } = req.validatedBody;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { loginId: loginIdOrEmail },
          { email: loginIdOrEmail },
        ],
        isActive: true,
      },
      include: { employee: { select: { id: true, name: true, profilePictureUrl: true, department: true, jobPosition: true, company: true } } },
    });

    // Same error regardless of which part failed — prevents account enumeration
    if (!user) throw new UnauthorizedError("That Login ID or password doesn't match our records.");

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedError("That Login ID or password doesn't match our records.");

    const { accessToken, refreshToken } = signTokens(user.id, user.role);
    setTokenCookies(res, accessToken, refreshToken);

    return success(res, {
      user: {
        id: user.id,
        loginId: user.loginId,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        employeeId: user.employee?.id,
        name: user.employee?.name,
        profilePictureUrl: user.employee?.profilePictureUrl,
        department: user.employee?.department,
        jobTitle: user.employee?.jobPosition,
        company: user.employee?.company,
      },
      mustChangePassword: user.mustChangePassword,
    }, 'Signed in successfully.');
  } catch (err) { next(err); }
}

// GET /api/v1/auth/me
export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { employee: { select: { id: true, name: true, profilePictureUrl: true, department: true, jobPosition: true, company: true } } },
    });
    if (!user) throw new NotFoundError('User not found.');

    return success(res, {
      id: user.id,
      loginId: user.loginId,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      employeeId: user.employee?.id,
      name: user.employee?.name,
      profilePictureUrl: user.employee?.profilePictureUrl,
      department: user.employee?.department,
      jobTitle: user.employee?.jobPosition,
      company: user.employee?.company,
    });
  } catch (err) { next(err); }
}

// POST /api/v1/auth/change-password
export async function changePassword(req, res, next) {
  try {
    const { newPassword } = req.validatedBody;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) throw new NotFoundError();

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, mustChangePassword: false },
    });

    return success(res, {}, 'Password changed successfully.');
  } catch (err) { next(err); }
}

// POST /api/v1/auth/refresh
export async function refreshToken(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new UnauthorizedError('No refresh token.');

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token. Please sign in again.');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) throw new UnauthorizedError();

    const { accessToken, refreshToken: newRefresh } = signTokens(user.id, user.role);
    setTokenCookies(res, accessToken, newRefresh);

    return success(res, { accessToken }, 'Token refreshed.');
  } catch (err) { next(err); }
}

// POST /api/v1/auth/sign-out
export async function signOut(req, res, next) {
  try {
    clearTokenCookies(res);
    return success(res, {}, 'Signed out successfully.');
  } catch (err) { next(err); }
}

// POST /api/v1/auth/forgot-password (placeholder — needs Resend setup)
export async function forgotPassword(req, res, next) {
  try {
    // Always return success to prevent account enumeration
    return success(res, {}, "If that email is registered, you'll receive a reset link shortly.");
  } catch (err) { next(err); }
}
