import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mdyizdiurvscwcxqyokt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1keWl6ZGl1cnZzY3djeHF5b2t0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MzIxNTIsImV4cCI6MjA4MTEwODE1Mn0.h-g4p_lQ2r0EVfhXCydXB5h-hEcWwu8BYExcdfasPvk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);