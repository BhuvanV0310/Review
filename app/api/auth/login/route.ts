import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { comparePassword, signToken } from '../../../lib/auth';

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

async function readUsers(): Promise<any[]> {
  const txt = await fs.readFile(USERS_PATH, 'utf8').catch(() => '[]');
  try {
    return JSON.parse(txt || '[]');
  } catch (e) {
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email ?? body.contactEmail ?? null;
    const password = body.password ?? null;
    const adminKey = body.adminKey ?? null;
    
    console.log('Login attempt:', { email, hasPassword: !!password, hasAdminKey: !!adminKey });
    
    if (!email || !password) return NextResponse.json({ success: false, message: 'Missing credentials' }, { status: 400 });

    const users = await readUsers();
    console.log('Available users:', users.map(u => ({ email: u.email, role: u.role })));
    
    const user = users.find(u => String(u.email).toLowerCase() === String(email).toLowerCase());
    if (!user) {
      console.log('User not found for email:', email);
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
    
    console.log('Found user:', { email: user.email, role: user.role });
    
    const ok = await comparePassword(String(password), user.passwordHash);
    console.log('Password comparison result:', ok);
    
    if (!ok) return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });

    // If user is admin and adminKey is provided, validate it
    if (user.role === 'admin' && adminKey && adminKey !== 'Admin123') {
      console.log('Invalid admin key provided');
      return NextResponse.json({ success: false, message: 'Invalid admin key' }, { status: 401 });
    }

    // If adminKey is provided but user is not admin, reject
    if (adminKey && user.role !== 'admin') {
      console.log('Admin key provided but user is not admin');
      return NextResponse.json({ success: false, message: 'Admin key provided but user is not admin' }, { status: 401 });
    }

    const token = signToken({ email, role: user.role ?? 'user' });
    console.log('Login successful for:', email);
    return NextResponse.json({ success: true, token, role: user.role ?? 'user' }, { status: 200 });
  } catch (err) {
    console.error('login route error', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
