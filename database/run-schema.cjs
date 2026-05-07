// Script chạy SQL schema lên Supabase
// Sử dụng service_role key

const fs = require('fs');
const https = require('https');

const SUPABASE_URL = 'npozfdcayxsivnpxgnzy.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wb3pmZGNheXhzaXZucHhnbnp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA5NzE2NywiZXhwIjoyMDkzNjczMTY3fQ.yj7YFt7XoWXUx6UnKjiFCeDiYjYWYfpQIpF59Lwp19o';

// Split schema into individual statements
const schema = fs.readFileSync('database/schema.sql', 'utf8');
const statements = schema
  .split(/;[\s]*\n/)
  .map(s => s.trim())
  .filter(s => s.length > 5 && !s.startsWith('--'));

async function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: SUPABASE_URL,
      path: '/rest/v1/rpc/',
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Use the SQL API endpoint instead
async function runSQLDirect(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql + ';' });
    const options = {
      hostname: SUPABASE_URL,
      path: '/pg/query',
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-connection-encrypted': 'true'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log(`Running ${statements.length} SQL statements...`);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 80).replace(/\n/g, ' ');
    process.stdout.write(`[${i+1}/${statements.length}] ${preview}... `);
    
    try {
      const result = await runSQLDirect(stmt);
      if (result.status >= 200 && result.status < 300) {
        console.log('OK');
      } else {
        console.log(`WARN (${result.status}): ${result.body.substring(0, 100)}`);
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }
  }
  
  console.log('\nDone! Verifying tables...');
  
  // Verify by querying categories
  const check = await runSQLDirect("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
  console.log('Tables:', check.body);
}

main().catch(console.error);
