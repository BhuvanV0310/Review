import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import Papa from 'papaparse';
import { verifyToken } from '../../lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Verify Authorization header (Bearer token)
  try {
    const auth = request.headers.get('authorization') || request.headers.get('Authorization') || '';
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const token = auth.replace(/^Bearer\s+/i, '');
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Auth verification failed' }, { status: 401 });
  }
  const tmpDir = path.join(process.cwd(), 'Python_models', 'uploads');
  fs.mkdirSync(tmpDir, { recursive: true });

  // Prefer request.formData(), fallback to formidable
  let files: any = {};
  let fields: any = {};
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
          files[key] = files[key] || [];
          files[key].push({ originalFilename: fname, filepath: tmpPath, size: buf.length, name: fname });
        } else {
          fields[key] = value;
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
        console.error('form parse error', (parsed as any).error);
        return NextResponse.json({ success: false, message: 'Upload parsing failed', debug: { error: (parsed as any).error } }, { status: 500 });
      }
      files = parsed.files || {};
      fields = parsed.fields || {};
    } catch (ex) {
      console.error('both formData and formidable parsing failed', e, ex);
      return NextResponse.json({ success: false, message: 'Upload parsing failed', debug: { err: String(e), ex: String(ex) } }, { status: 500 });
    }
  }

  // attempt to get company slug from fields
  let companySlug = 'company';
  try {
    if (fields && fields.company) {
      const comp = typeof fields.company === 'string' ? JSON.parse(fields.company) : fields.company;
      companySlug = ((comp.organisationName || comp.organisation_name || 'company') + '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'company';
    }
  } catch (err) {
    companySlug = 'company';
  }

  // Move uploaded files to Python_models directory
  try {
    const fileKeys = Object.keys(files || {});
    const mergedCsvPath = path.join(process.cwd(), 'Python_models', 'uploads', `${companySlug}_merged_${Date.now()}.csv`);
    let mergedHeader: string | null = null;
    const mergedStream = fs.createWriteStream(mergedCsvPath, { encoding: 'utf8' });

    for (const key of fileKeys) {
      const file = (files as any)[key];
      const fileArr = Array.isArray(file) ? file : [file];
      for (const f of fileArr) {
        const src = f.filepath || f.path;
        // read file and append to merged stream, handle header
        let content = fs.readFileSync(src, 'utf-8');

        // Check for mapping hint in fields: either map_<key> or a mappings JSON in fields
        try {
          const mapFieldKey = `map_${key}`;
          let mapFrom: string | null = null;
          if (fields && typeof fields[mapFieldKey] === 'string') {
            mapFrom = fields[mapFieldKey];
          } else if (fields && typeof fields.mappings === 'string') {
            try {
              const mp = JSON.parse(fields.mappings);
              if (mp && mp[key]) mapFrom = mp[key];
            } catch (e) {
              // ignore parse error
            }
          }
          if (mapFrom) {
            // perform server-side mapping: parse, rename column, unparse
            try {
              const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
              const rows = parsed.data as any[];
              const cols = parsed.meta && (parsed.meta as any).fields ? (parsed.meta as any).fields as string[] : [];
              if (cols && cols.length > 0 && cols.includes(mapFrom)) {
                const mappedHeader = cols.map(h => (h === mapFrom ? 'text' : h));
                const remappedRows = rows.map(r => {
                  const out: Record<string, any> = {};
                  for (const c of cols) {
                    const keyName = c === mapFrom ? 'text' : c;
                    out[keyName] = r[c];
                  }
                  return out;
                });
                content = Papa.unparse(remappedRows, { columns: mappedHeader });
              }
            } catch (e) {
              console.error('server-side mapping failed for', key, e);
            }
          }
        } catch (e) {
          // ignore mapping errors
        }

        const lines = content.split(/\r?\n/).filter(Boolean);
        if (lines.length === 0) continue;
        const header = lines[0];
        if (!mergedHeader) {
          mergedHeader = header;
          mergedStream.write(header + '\n');
        }
        // append rest lines
        const bodyLines = lines.slice(1);
        for (const ln of bodyLines) mergedStream.write(ln + '\n');
      }
    }
    mergedStream.end();

    // prepare per-company public folder
    const companyPublic = path.join(process.cwd(), 'public', 'companies', companySlug);
    fs.mkdirSync(companyPublic, { recursive: true });

    // Run Python exporter with merged CSV as input and company-specific output
    const script = path.join(process.cwd(), 'Python_models', 'export_top_worst.py');
    const outTop = path.join(companyPublic, 'top_worst_reviews.json');
    const outChart = path.join(companyPublic, 'chart_data.json');
    await new Promise<void>((resolve, reject) => {
      execFile('python3', [script, '--input', mergedCsvPath, '--output', outTop], { cwd: path.join(process.cwd(), 'Python_models') }, (error, stdout, stderr) => {
        if (error) return reject({ error, stderr });
        resolve();
      });
    });

    try {
      const json = JSON.parse(fs.readFileSync(outTop, 'utf-8'));
      const chartJson = JSON.parse(fs.readFileSync(outChart, 'utf-8'));
      return NextResponse.json({ success: true, data: json, chart: chartJson, urls: { top: `/companies/${companySlug}/top_worst_reviews.json`, chart: `/companies/${companySlug}/chart_data.json` } });
    } catch (ex) {
      console.error('read json error', ex);
      return NextResponse.json({ success: false, message: 'Could not read output' }, { status: 500 });
    }
  } catch (ex) {
    console.error('file move or processing error', ex);
    return NextResponse.json({ success: false, message: 'File handling or processing failed' }, { status: 500 });
  }
}
