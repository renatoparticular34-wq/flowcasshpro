import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfgsdgabwtkzcqkuofcg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ3NkZ2Fid3RremNxa3VvZmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDI2NjMsImV4cCI6MjA4NTExODY2M30.3qOdJCE9R32KNBRNYOaNSpTRjy-4ZxlHRhHqmwKlAc8';

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase cliente inicializado!');
