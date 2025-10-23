import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { verifyToken } from '../../../lib/auth';

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

async function readUsers(): Promise<any[]> {
	try {
		const txt = await fs.readFile(USERS_PATH, 'utf8');
		return JSON.parse(txt || '[]');
	} catch (e) {
		return [];
	}
}

async function writeUsers(users: any[]) {
	await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), 'utf8');
}

export async function POST(req: Request) {
	try {
		const authHeader = req.headers.get('authorization') || '';
		const authToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader || null;
		const decoded = verifyToken(authToken || undefined) as any;
		if (!decoded || decoded.role !== 'admin') {
			return NextResponse.json({ success: false, message: 'Forbidden: admin token required' }, { status: 403 });
		}

		const body = await req.json().catch(() => ({}));
		const emails: string[] = body.emails || [];
		if (!emails.length) return NextResponse.json({ success: false, message: 'No emails provided' }, { status: 400 });

		const users = await readUsers();
		const remaining = users.filter(u => !emails.includes(String(u.email).toLowerCase()));
		await writeUsers(remaining);
		return NextResponse.json({ success: true }, { status: 200 });
	} catch (e) {
		console.error('delete-user error', e);
		return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
	}
}

