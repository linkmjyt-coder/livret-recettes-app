import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gqilodotbownxqykemrw.supabase.co";

const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaWxvZG90Ym93bnhxeWtlbXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzgyNTEsImV4cCI6MjA5MjQ1NDI1MX0.jDNcrX_WyVxeavpQBl3thwwZT2lyCsia8Rfc1EV5Hk0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);