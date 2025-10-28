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

export async function GET(req: Request) {
	try {
		const authHeader = req.headers.get('authorization') || '';
		const authToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader || null;
		const decoded = verifyToken(authToken || undefined) as any;
		if (!decoded || decoded.role !== 'admin') {
			return NextResponse.json({ success: false, message: 'Forbidden: admin token required' }, { status: 403 });
		}

		const users = await readUsers();
		const safe = users.map(u => ({ email: u.email, name: u.name || null, role: u.role || 'user', branches: u.branches || [] }));
		return NextResponse.json({ success: true, users: safe }, { status: 200 });
	} catch (e) {
		console.error('list-users error', e);
		return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
	}
}

