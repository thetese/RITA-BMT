const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://xpdgenyyytfmibznhpesg.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwZGdlbnl5dGZtaWJ6bmhwZXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNTczNzQsImV4cCI6MjA5ODkzMzM3NH0.XhKxdN9_7AwxnaEE_Ejvh3OcqCwuhzzczr1771pr_l4';
const supabase = createClient(url, key);

async function test() {
  const payload = {"id":"8dc64164-6b54-4c39-99f7-8b0ddc0e64c4","username":"jus","role":"Admin","pin":"","createdAt":"2026-07-15 04:18:24","securityQuestion":"simba","securityAnswer":"simba","hourlyRate":0,"commissionRate":0,"storeId":"store1","passwordHash":"$2b$10$vTBoVjwMoEjYUzmV4ED7bOt4WBCFohqf4b6iezQrNnDgPynd1chyq"};
  console.log('Attempting upsert...');
  const { data, error } = await supabase.from('users').upsert(payload);
  console.log('--- UPSERT RESULT ---');
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
