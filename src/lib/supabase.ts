
// Re-export the supabase client from our integration
import { supabase } from '@/integrations/supabase/client';
export { supabase };

console.info("✅ Supabase client re-exported successfully from src/lib/supabase.ts");
