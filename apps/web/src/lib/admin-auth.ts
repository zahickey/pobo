import { createHash } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'pobo_admin';

function expectedCookieValue(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('Missing ADMIN_PASSWORD — copy .env.example to .env.local.');
  return createHash('sha256').update(password).digest('hex');
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const cookie = store.get(COOKIE_NAME);
  return cookie?.value === expectedCookieValue();
}

export async function checkPasswordAndSetCookie(password: string): Promise<boolean> {
  if (password !== process.env.ADMIN_PASSWORD) return false;
  const store = await cookies();
  store.set(COOKIE_NAME, expectedCookieValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: 60 * 60 * 24 * 30,
  });
  return true;
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
