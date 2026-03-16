/**
 * Migration script: products.json → Supabase products table (using native fetch)
 *
 * Required env vars (set in .env.local or export them):
 *   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read credentials from environment — never hardcode secrets
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ Missing required environment variables.');
  console.error('   Set: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD');
  process.exit(1);
}

async function migrate() {
  console.log('🔐 Logging in as admin...');
  
  // 1. Auth via REST API
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })
  });
  
  const authData = await authRes.json();
  if (!authRes.ok) {
    console.error('❌ Auth failed. Register the admin user first:', authData.error_description || authData.msg);
    process.exit(1);
  }
  
  const token = authData.access_token;
  console.log('✅ Auth ok');

  // 2. Load JSON
  const jsonPath = resolve(__dirname, '../src/data/products.json');
  const products = JSON.parse(readFileSync(jsonPath, 'utf8'));

  console.log(`📦 Found ${products.length} products to migrate\n`);

  let success = 0;
  let failed = 0;

  // 3. Insert each product via REST API
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const row = {
      name: p.name,
      category: p.category,
      price: p.price,
      colors: p.colors || [],
      sort_order: i,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(row)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`  ❌ [${i + 1}/${products.length}] ${p.name}: ${err}`);
      failed++;
    } else {
      console.log(`  ✅ [${i + 1}/${products.length}] ${p.name}`);
      success++;
    }
  }

  console.log(`\n🏁 Migration done: ${success} ok, ${failed} failed`);
}

migrate().catch(console.error);
