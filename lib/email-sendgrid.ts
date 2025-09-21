// MOCKED EMAIL FUNCTIONS (no real emails sent)
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = "no-reply@example.com",
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}): Promise<void> {
  console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
}

export async function sendPasswordResetEmail({
  email,
  resetToken,
  userName,
}: {
  email: string;
  resetToken: string;
  userName?: string;
}): Promise<boolean> {
  console.log(
    `[MOCK EMAIL] Password reset for: ${email}, token: ${resetToken}`
  );
  return true;
}

export async function sendEmailVerification({
  email,
  verificationToken,
  userName,
}: {
  email: string;
  verificationToken: string;
  userName?: string;
}): Promise<boolean> {
  console.log(
    `[MOCK EMAIL] Email verification for: ${email}, token: ${verificationToken}`
  );
  return true;
}
