import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { hashPassword as hashPwd, signToken, verifyToken } from '../../../lib/auth';

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

async function ensureUsersFile() {
  try {
    await fs.mkdir(path.dirname(USERS_PATH), { recursive: true });
    await fs.access(USERS_PATH).catch(async () => {
      await fs.writeFile(USERS_PATH, JSON.stringify([]), 'utf8');
    });
  } catch (e) {
    // ignore
  }
}

async function readUsers(): Promise<any[]> {
  await ensureUsersFile();
  const txt = await fs.readFile(USERS_PATH, 'utf8').catch(() => '[]');
  try {
    return JSON.parse(txt || '[]');
  } catch (e) {
    return [];
  }
}

async function writeUsers(users: any[]) {
  await ensureUsersFile();
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), 'utf8');
}
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let email: string | null = null;
    let password: string | null = null;
    let role: string = 'user';
    let adminKey: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const companyRaw = formData.get('company');
      try {
        if (companyRaw) {
          const company = JSON.parse(String(companyRaw));
          email = company.contactEmail ?? null;
          password = company.password ?? null;
          adminKey = company.adminKey ?? null;
        }
      } catch (e) {
        // ignore
      }
    } else {
      const body = await req.json().catch(() => ({}));
      email = body.contactEmail ?? null;
      password = body.password ?? null;
      adminKey = body.adminKey ?? null;
      // optional role
      if (body.role) role = body.role;
    }

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'email and password are required' }, { status: 400 });
    }
    
    // If adminKey is provided, validate it for admin registration
    if (adminKey && adminKey === "Admin123") {
      role = "admin";
    } else if (adminKey) {
      return NextResponse.json({ success: false, message: 'Invalid admin key' }, { status: 403 });
    } else {
      // For regular user creation, require admin token
      const authHeader = req.headers.get('authorization') || '';
      const authToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader || null;
      const decoded = verifyToken(authToken || undefined) as any;
      if (!decoded || decoded.role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Forbidden: admin token required for user creation' }, { status: 403 });
      }
    }

    const users = await readUsers();
    const exists = users.find(u => String(u.email).toLowerCase() === String(email).toLowerCase());
    if (exists) {
      return NextResponse.json({ success: false, message: 'User already registered' }, { status: 409 });
    }

  const passwordHash = await hashPwd(String(password));
    const user = { email, passwordHash, role, createdAt: new Date().toISOString() };
    users.push(user);
    await writeUsers(users);

    // Return a simple token (not a real JWT) for dev convenience
  const token = signToken({ email, role });

  return NextResponse.json({ success: true, token, role }, { status: 200 });
  } catch (err) {
    console.error('register route error', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
