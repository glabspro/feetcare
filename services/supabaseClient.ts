
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.45.0';

const supabaseUrl = 'https://qqfdpswsdljiwehfrbjg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxZmRwc3dzZGxqaXdlaGZyYmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NDM0MzEsImV4cCI6MjA4MzExOTQzMX0.s9hBKiEh7Z-lcpZ4JSFtj3e5SaPYZb9-asMqIpZHb6c';

export const supabase = createClient(supabaseUrl, supabaseKey);
