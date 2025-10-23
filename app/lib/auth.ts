import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

// Ensure JWT_SECRET has the correct type expected by jsonwebtoken
const JWT_SECRET: Secret = (process.env.JWT_SECRET || 'dev-secret-change-me') as Secret;
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: string | object | Buffer): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES as unknown as SignOptions['expiresIn'] };
  return jwt.sign(payload as string | object | Buffer, JWT_SECRET, options);
}

export function verifyToken(token?: string) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as string | jwt.JwtPayload;
  } catch (e) {
    return null;
  }
}
