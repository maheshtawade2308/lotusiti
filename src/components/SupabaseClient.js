
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://lntzsiswrrlqvqwfhlfm.supabase.co" //Project URL from supabase portal

const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxudHpzaXN3cnJscXZxd2ZobGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxODcwNjMsImV4cCI6MjA3NTc2MzA2M30.G5Ol7Y8nWjR2pLoKt0-4q-JUdavk_8jrWiZwuSibVSs"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)