import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const fromAddress = process.env.EMAIL_FROM || "Artisan Hub <onboarding@resend.dev>";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}`;

  // Dev / not-yet-configured fallback: log the link instead of failing the
  // signup flow. Set RESEND_API_KEY in .env to actually send emails.
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY não configurada. Link de verificação para ${email}:\n${verifyUrl}`
    );
    return;
  }

  await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: "Confirme seu e-mail — Artisan Hub",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Confirme seu e-mail</h2>
        <p>Obrigado por se cadastrar no Artisan Hub. Clique no botão abaixo para confirmar seu e-mail e ativar sua conta:</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background:#020202;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
            Confirmar e-mail
          </a>
        </p>
        <p>Ou copie e cole este link no navegador:</p>
        <p style="word-break: break-all; color: #555;">${verifyUrl}</p>
        <p style="color: #888; font-size: 13px;">Este link expira em 24 horas. Se você não criou uma conta, pode ignorar este e-mail.</p>
      </div>
    `,
  });
}
