// Simple credential check for admin access (temporary)
// Expects POST { username, password }
// Validates against env ADMIN_USER / ADMIN_PASS
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'missing-credentials' }, { status: 400 });
    }
    const USER = process.env.ADMIN_USER || 'admin';
    const PASS = process.env.ADMIN_PASS || 'admin';
    if (username === USER && password === PASS) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'invalid' }, { status: 401 });
  } catch (e) {
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
