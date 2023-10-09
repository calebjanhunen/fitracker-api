// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

export async function generateHashPassword(pwd: string): Promise<string> {
  return await bcrypt.hash(pwd, 10);
}

export async function comparePasswords(
  pwd1: string,
  pwd2: string,
): Promise<boolean> {
  return await bcrypt.compare(pwd1, pwd2);
}
