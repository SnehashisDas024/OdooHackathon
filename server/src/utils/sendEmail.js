// Email utility using Resend
// Falls back to console.log if RESEND_API_KEY is not configured

let resendClient = null;

async function getResend() {
  if (!resendClient && process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_placeholder')) {
    const { Resend } = await import('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendWelcomeEmail({ to, name, loginId, tempPassword }) {
  const resend = await getResend();
  if (!resend) {
    console.log(`[EMAIL SKIP] Welcome email to ${to}:`, { loginId, tempPassword });
    return;
  }

  await resend.emails.send({
    from: 'HRMS <noreply@yourdomain.com>',
    to,
    subject: 'Welcome to HRMS — Your login credentials',
    html: `
      <h2>Welcome to HRMS, ${name}!</h2>
      <p>Your account has been created. Here are your login credentials:</p>
      <ul>
        <li><strong>Login ID:</strong> <code>${loginId}</code></li>
        <li><strong>Temporary Password:</strong> <code>${tempPassword}</code></li>
      </ul>
      <p>Please log in and change your password immediately.</p>
      <p style="color:#999;font-size:12px;">This email was sent automatically. Do not reply.</p>
    `,
  });
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  const resend = await getResend();
  if (!resend) {
    console.log(`[EMAIL SKIP] Password reset to ${to}:`, resetUrl);
    return;
  }

  await resend.emails.send({
    from: 'HRMS <noreply@yourdomain.com>',
    to,
    subject: 'HRMS — Reset your password',
    html: `
      <h2>Reset your HRMS password</h2>
      <p>Click the link below to reset your password. It expires in 1 hour.</p>
      <a href="${resetUrl}" style="background:#3454D1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Reset Password</a>
      <p style="color:#999;font-size:12px;">If you didn't request this, ignore this email.</p>
    `,
  });
}
