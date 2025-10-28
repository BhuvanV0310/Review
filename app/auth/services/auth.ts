import { AuthResponse, RegisterPayload } from "../types";

export async function loginUser(email: string, password: string, adminKey?: string) {
  try {
    const base = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL ? String(process.env.NEXT_PUBLIC_API_URL) : '';
    const url = base ? `${base.replace(/\/+$/, '')}/api/auth/login` : '/api/auth/login';
    const res = await fetch(url, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ email, password, adminKey }) 
    });
    const data = await res.json().catch(() => ({ success: false, message: 'Invalid server response' }));
    return data;
  } catch (err) {
    console.error('loginUser error', err);
    return { success: false, message: 'Network error' };
  }
}

export async function registerUser(payload: any): Promise<AuthResponse> {
  try {
    const base = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL ? String(process.env.NEXT_PUBLIC_API_URL) : '';
    const url = base ? `${base.replace(/\/+$/, '')}/api/auth/register` : '/api/auth/register';
    let options: RequestInit;
    // If payload is a FormData (contains files), send without content-type so browser sets multipart boundary
    if (payload instanceof FormData) {
      options = { method: "POST", body: payload };
    } else {
      options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) };
    }
    const res = await fetch(url, options);
    // If backend returns JSON
    const data = await res.json().catch(() => ({ success: false, message: 'Invalid server response' }));
    return data;
  } catch (err) {
    console.error('registerUser error', err);
    return { success: false, message: "Network error" };
  }
}