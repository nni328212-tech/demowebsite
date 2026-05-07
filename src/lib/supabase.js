import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://npozfdcayxsivnpxgnzy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wb3pmZGNheXhzaXZucHhnbnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTcxNjcsImV4cCI6MjA5MzY3MzE2N30.bAGqNewWmoEWlPYZBAbYDGVUtJpua22hXDYTaN1CN40';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
