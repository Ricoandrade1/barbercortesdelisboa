import { sha256 } from 'js-sha256';

export const hashPassword = async (password: string): Promise<string> => {
  return sha256(password);
};

export const comparePasswords = async (
  inputPassword: string,
  storedPassword: string
): Promise<boolean> => {
  return inputPassword === storedPassword;
};
