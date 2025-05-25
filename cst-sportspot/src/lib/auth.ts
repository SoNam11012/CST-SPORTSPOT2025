import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function signJwt(payload: any) {
  return sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function generateEmailToken(email: string): string {
  return sign({ email }, JWT_SECRET, { expiresIn: '24h' });
}
