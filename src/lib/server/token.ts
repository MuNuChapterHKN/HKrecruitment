import bcrypt from 'bcrypt';

export const SALT_ROUNDS = 10;

export const compare = async (plain: string, hash: string) =>
  await bcrypt.compare(plain, hash);

export const hash = async (plain: string) =>
  await bcrypt.hash(plain, SALT_ROUNDS);
