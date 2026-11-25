import { supabase } from '../lib/supabase'

export async function testDatabaseConnection() {
  const { data, error, status } = await supabase
    .rpc('health_check')

  if (error) {
    console.error('Database error:', error.message)
    return
  }

  console.log('Database connection successful!')
  console.log('HTTP status:', status)
  console.log('Database response:', data)
}