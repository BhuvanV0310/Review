import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const tmpDir = path.join(process.cwd(), 'tmp', 'map_uploads');
  fs.mkdirSync(tmpDir, { recursive: true });

  // Prefer request.formData(), fallback to formidable
  let filesObj: any = {};
  let fieldsObj: any = {};
  try {
    const formData = await (request as any).formData();
    if (formData) {
      for (const entry of formData.entries()) {
        const [key, value] = entry as [string, any];
        if (value && typeof value === 'object' && typeof value.arrayBuffer === 'function') {
          const buf = Buffer.from(await value.arrayBuffer());
          const fname = value.name || `${key}.csv`;
          const tmpPath = path.join(tmpDir, `${Date.now()}_${fname}`);
          fs.writeFileSync(tmpPath, buf);
          filesObj[key] = filesObj[key] || [];
          filesObj[key].push({ originalFilename: fname, filepath: tmpPath, size: buf.length, name: fname });
        } else {
          fieldsObj[key] = value;
        }
      }
    }
  } catch (e) {
    try {
      const form = new formidable.IncomingForm({ multiples: false });
      const parsed: { fields?: any; files?: any; error?: any } = await new Promise((resolve) => {
        form.parse(request as any, (err: any, fields: any, files: any) => {
          if (err) return resolve({ error: err });
          resolve({ fields, files });
        });
      });
      if ((parsed as any).error) {
        console.error('map parse error', (parsed as any).error);
        return NextResponse.json({ success: false, message: 'Upload parse failed', debug: { error: (parsed as any).error } }, { status: 400 });
      }
      filesObj = parsed.files || {};
      fieldsObj = parsed.fields || {};
    } catch (ex) {
      console.error('map parse both methods failed', e, ex);
      return NextResponse.json({ success: false, message: 'Upload parse failed', debug: { err: String(e), ex: String(ex) } }, { status: 500 });
    }
  }

  try {
    const keys = Object.keys(filesObj || {});
    if (keys.length === 0) return NextResponse.json({ success: false, message: 'No file uploaded', debug: { fields: fieldsObj } }, { status: 400 });
    const file = Array.isArray(filesObj[keys[0]]) ? filesObj[keys[0]][0] : filesObj[keys[0]];
    const mapFrom = fieldsObj && fieldsObj.mapFrom ? fieldsObj.mapFrom : null;
    const filepath = file.filepath || file.path || (file._writeStream && file._writeStream.path);
    if (!filepath) return NextResponse.json({ success: false, message: 'Uploaded file missing path', debug: { file } }, { status: 400 });
    const text = fs.readFileSync(filepath, 'utf-8');
    const parsedCsv = Papa.parse(text, { header: true, skipEmptyLines: true });
    const rows = parsedCsv.data as any[];
    const fields = parsedCsv.meta && (parsedCsv.meta as any).fields ? (parsedCsv.meta as any).fields as string[] : [];

    if (!fields || fields.length === 0) {
      return NextResponse.json({ success: false, message: 'Could not parse CSV headers' }, { status: 400 });
    }

    if (!mapFrom || !fields.includes(mapFrom)) {
      return NextResponse.json({ success: false, message: 'Invalid mapping column', debug: { fields } }, { status: 400 });
    }

    const mappedHeader = fields.map(h => (h === mapFrom ? 'text' : h));
    const remappedRows = rows.map(r => {
      const out: Record<string, any> = {};
      for (const f of fields) {
        const key = f === mapFrom ? 'text' : f;
        out[key] = r[f];
      }
      return out;
    });

    const newCsv = Papa.unparse(remappedRows, { columns: mappedHeader });

    // quick validation: check for text-like column
    const hasText = mappedHeader.map(h => h.toLowerCase()).includes('text');
    const size = Buffer.byteLength(newCsv, 'utf-8');

    return NextResponse.json({ success: true, mappedCsv: newCsv, validation: { hasTextColumn: hasText, size } });
  } catch (err: any) {
    console.error('map error', err?.stack || err);
    return NextResponse.json({ success: false, message: `Mapping failed: ${err?.message || String(err)}` }, { status: 500 });
  }
}
