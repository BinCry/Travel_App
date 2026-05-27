const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

export function assertStrongPassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    throw Object.assign(new Error("PASSWORD_TOO_WEAK"), { statusCode: 400 });
  }
}

export const passwordPolicy = {
  minLength: MIN_PASSWORD_LENGTH,
  maxLength: MAX_PASSWORD_LENGTH,
};
