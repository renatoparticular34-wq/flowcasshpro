import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfgsdgabwtkzcqkuofcg.supabase.co';
const supabaseKey = 'sb_publishable_j0BNqEIOMIefLgAIuHL-lQ__EszbU_j';

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase cliente inicializado!');
