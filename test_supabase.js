const { createClient } = require('@supabase/supabase-js');

const url = 'https://xpdgenyyytfmibznhpesg.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwZGdlbnl5dGZtaWJ6bmhwZXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNTczNzQsImV4cCI6MjA5ODkzMzM3NH0.XhKxdN9_7AwxnaEE_Ejvh3OcqCwuhzzczr1771pr_l4';
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('users').select('*');
  console.log('--- SUPABASE USERS ---');
  console.log(data);
  console.log('Error:', error);
}

test();
