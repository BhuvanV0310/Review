import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const tmpDir = path.join(process.cwd(), 'tmp', 'validate_uploads');
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
      const form = new formidable.IncomingForm({ multiples: true });
      const parsed: { fields?: any; files?: any; error?: any } = await new Promise((resolve) => {
        form.parse(request as any, (err: any, flds: any, fls: any) => {
          if (err) return resolve({ error: err });
          resolve({ fields: flds, files: fls });
        });
      });
      if ((parsed as any).error) {
        console.error('validate parse error', (parsed as any).error);
      } else {
        filesObj = parsed.files || {};
        fieldsObj = parsed.fields || {};
      }
    } catch (e2) {
      console.error('both formData and formidable parsing failed', e, e2);
    }
  }

  if (!filesObj || Object.keys(filesObj).length === 0) {
    console.error('validate-upload: no files found after parsing attempts', { fields: fieldsObj, files: filesObj });
    return NextResponse.json({ success: false, message: 'No files uploaded', debug: { fields: fieldsObj, files: filesObj } }, { status: 400 });
  }
  const filesFinal = filesObj;
  const results: Record<string, any> = {};

  try {
    const fileKeys = Object.keys(filesFinal);
    for (const key of fileKeys) {
      const f = filesFinal[key];
      const arr = Array.isArray(f) ? f : [f];
      for (const item of arr) {
        // support different formidable versions: filepath, path, or _writeStream.path
        const filepath = item.filepath || item.path || (item._writeStream && item._writeStream.path) || null;
        if (!filepath) {
          console.error('validate-upload: uploaded file missing filepath:', Object.keys(item));
          throw new Error('Uploaded file missing temporary path');
        }
        const stat = fs.statSync(filepath);
        const size = stat.size;
        // read file and parse robustly using PapaParse to handle quoted headers/fields
        const content = fs.readFileSync(filepath, { encoding: 'utf-8', flag: 'r' });
        const parsedCsv = Papa.parse(content, { header: true, skipEmptyLines: true });
        const columns = (parsedCsv.meta && (parsedCsv.meta as any).fields) ? (parsedCsv.meta as any).fields.map((c: string) => String(c).trim()) : [];
        const sampleRows = (parsedCsv.data as any[]).slice(0, 3).map(r => r || {});
  const textLike = columns.find((c: string) => ['text','review','review_text','comment','body'].includes((c || '').toLowerCase()));

        const fileResult = {
          name: item.originalFilename || item.name || key,
          size,
          columns,
          hasTextColumn: Boolean(textLike),
          sampleRows,
          ok: size <= 10 * 1024 * 1024 && Boolean(textLike), // require <=10MB and a text column
        };

        // use a unique key per uploaded file
        const resKey = item.originalFilename || `${key}`;
        results[resKey] = fileResult;
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error('validation error', err?.stack || err);
    // Build debug info
    const debug: any = { fields: fieldsObj, files: filesObj, firstFileKeys: undefined, filepathTried: undefined };
    try {
      const firstKey = Object.keys(filesObj || {})[0];
      const f = filesObj ? (Array.isArray(filesObj[firstKey]) ? filesObj[firstKey][0] : filesObj[firstKey]) : null;
      if (f) {
        debug.firstFileKeys = Object.keys(f);
        debug.filepathTried = f.filepath || f.path || (f._writeStream && f._writeStream.path) || null;
      }
    } catch (e) {}
    const msg = err && err.message ? String(err.message) : 'Validation failed';
    return NextResponse.json({ success: false, message: `Validation failed: ${msg}`, debug }, { status: 500 });
  }
}
