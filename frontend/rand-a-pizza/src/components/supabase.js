import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fglnqjtmquauewvycbgh.supabase.co'
const supabaseKey = 'sb_publishable_W_tc4ZpzPXCHlBbdDdVDEA_nAyznWPV'

export const supabase = createClient(supabaseUrl, supabaseKey)