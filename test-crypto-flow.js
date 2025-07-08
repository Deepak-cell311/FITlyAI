import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCryptoTokenFlow() {
  console.log('Testing updated signup flow with crypto tokens...');
  
  // Create test user with updated crypto flow
  const testEmail = `crypto${Date.now()}@gmail.com`;
  
  const signupResponse = await fetch('http://localhost:5000/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'SecurePassword123!@#',
      first_name: 'Crypto',
      last_name: 'Flow'
    })
  });
  
  console.log('1. Signup response:', signupResponse.ok ? 'Success' : 'Failed');
  
  if (!signupResponse.ok) {
    const error = await signupResponse.json();
    console.error('Signup error:', error);
    return false;
  }
  
  // Wait for database write and email processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Get the auth user first, then find profile
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const authUser = authUsers?.users?.find(u => u.email === testEmail);
  
  if (!authUser) {
    console.error('Auth user not found');
    return false;
  }
  
  // Get user profile to check crypto token
  const { data: user } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();
    
  if (!user) {
    console.error('User profile not found');
    return false;
  }
  
  console.log('2. User profile created:');
  console.log('   Email field included:', !!user.email);
  console.log('   Token type:', typeof user.email_verification_token);
  console.log('   Token length:', user.email_verification_token?.length);
  console.log('   Email verified:', user.email_verified);
  
  // Crypto tokens should be 64 characters (32 bytes in hex)
  const isCryptoToken = user.email_verification_token && 
                       user.email_verification_token.length === 64 &&
                       /^[a-f0-9]+$/.test(user.email_verification_token);
  
  console.log('   Is crypto token:', isCryptoToken);
  
  // Test verification with crypto token
  const verifyResponse = await fetch(`http://localhost:5000/api/verify-email?token=${user.email_verification_token}`, {
    method: 'GET',
    redirect: 'manual'
  });
  
  console.log('3. Verification test:');
  console.log('   Status:', verifyResponse.status);
  console.log('   Redirect successful:', verifyResponse.status === 302);
  
  // Check final verification status
  const { data: verifiedUser } = await supabase
    .from('user_profiles')
    .select('email_verified, email_verification_token')
    .eq('id', user.id)
    .single();
    
  console.log('4. Final verification status:');
  console.log('   Email verified:', verifiedUser.email_verified);
  console.log('   Token cleared:', !verifiedUser.email_verification_token);
  
  return isCryptoToken && 
         verifyResponse.status === 302 && 
         verifiedUser.email_verified && 
         !verifiedUser.email_verification_token;
}

testCryptoTokenFlow().then(success => {
  console.log('\n=== CRYPTO TOKEN FLOW TEST ===');
  console.log(success ? 'Crypto token flow working perfectly' : 'Issues detected in crypto flow');
}).catch(error => {
  console.error('Crypto flow test error:', error);
});