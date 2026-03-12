/**
 * Migration script: products.json → Supabase products table
 * 
 * Usage: node scripts/migrateProducts.js
 * 
 * Prerequisites:
 * 1. Run the supabase-setup.sql in Supabase SQL Editor first
 * 2. The admin user (ritastudio33@gmail.com) must exist in Supabase Auth
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://hubhkzrqfscoxsuukkqd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YmhrenJxZnNjb3hzdXVra3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTU1ODYsImV4cCI6MjA4ODM5MTU4Nn0.b5J7VYNg9Rxnoo1KysfifoJkapNNgwXSuGgUuCLXe_M';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function migrate() {
  console.log('🔐 Logging in as admin...');
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email: 'ritastudio33@gmail.com',
    password: 'Tania2014',
  });

  if (authErr) {
    console.error('❌ Auth failed. Register the admin user first:', authErr.message);
    console.log('\n📝 Go to your Supabase Auth dashboard and create the user:');
    console.log('   Email: ritastudio33@gmail.com');
    console.log('   Password: Tania2014');
    process.exit(1);
  }

  console.log('✅ Auth ok');

  const jsonPath = resolve(__dirname, '../src/data/products.json');
  const products = JSON.parse(readFileSync(jsonPath, 'utf8'));

  console.log(`📦 Found ${products.length} products to migrate\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const row = {
      name: p.name,
      category: p.category,
      price: p.price,
      colors: p.colors || [],
      sort_order: i,
    };

    const { error } = await supabase.from('products').insert(row);

    if (error) {
      console.error(`  ❌ [${i + 1}/${products.length}] ${p.name}: ${error.message}`);
      failed++;
    } else {
      console.log(`  ✅ [${i + 1}/${products.length}] ${p.name}`);
      success++;
    }
  }

  console.log(`\n🏁 Migration done: ${success} ok, ${failed} failed`);
  process.exit(0);
}

migrate();
