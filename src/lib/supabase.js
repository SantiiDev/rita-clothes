import { createClient } from '@supabase/supabase-js';

// The anon key is safe to expose in frontend code — Supabase Row Level Security (RLS)
// controls what authenticated and anonymous users can access.
const supabaseUrl = 'https://hubhkzrqfscoxsuukkqd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YmhrenJxZnNjb3hzdXVra3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTU1ODYsImV4cCI6MjA4ODM5MTU4Nn0.b5J7VYNg9Rxnoo1KysfifoJkapNNgwXSuGgUuCLXe_M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
