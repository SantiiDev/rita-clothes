import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testAuth() {
  console.log('Testing login with unconfirmed email...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'ritatest99@gmail.com',
    password: 'password123'
  });
  console.log('Login Result:', { data, error: error ? error.message : null });
}
testAuth();
