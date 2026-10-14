import { requireAuth, authResult, restoreSession, getSession } from "./api.js";
export async function sendLoginCode(email) {
  await authResult(
    requireAuth().emailOtp.sendVerificationOtp({ email: email.trim(), type: "sign-in" }),
  );
}
export async function finishSignIn() {
  await restoreSession();
  const session = getSession();
  if (!session?.user) throw new Error("Sign-in could not be completed. Please try again.");
  return session.user.role === "ADMIN" ? "/admin" : "/";
}
export async function verifyLoginCode(email, otp) {
  if (!/^\d{6}$/.test(otp.trim())) throw new Error("Enter the six-digit code from your email.");
  await authResult(requireAuth().signIn.emailOtp({ email: email.trim(), otp: otp.trim() }));
  return finishSignIn();
}
export async function socialSignIn(provider) {
  if (!["google", "github"].includes(provider)) throw new Error("Unsupported sign-in provider");
  await authResult(
    requireAuth().signIn.social({
      provider,
      callbackURL: window.location.origin + "/account",
      errorCallbackURL: window.location.origin + "/login?error=oauth",
    }),
  );
}
