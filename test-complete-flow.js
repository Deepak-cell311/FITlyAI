import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCompleteEmailFlow() {
  console.log('Testing complete email verification flow with new GET route...');
  
  // Create test user
  const testEmail = `complete${Date.now()}@gmail.com`;
  
  const signupResponse = await fetch('http://localhost:5000/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'SecurePassword123!@#',
      first_name: 'Complete',
      last_name: 'Flow'
    })
  });
  
  console.log('1. Signup response:', signupResponse.ok ? 'Success' : 'Failed');
  
  // Wait for database write
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Get user profile
  const { data: user } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('first_name', 'Complete')
    .eq('last_name', 'Flow')
    .single();
    
  if (!user) {
    console.error('User not found');
    return false;
  }
  
  console.log('2. User created successfully');
  console.log('   Token exists:', !!user.email_verification_token);
  console.log('   Email verified:', user.email_verified);
  
  const token = user.email_verification_token;
  
  // Test GET verification (simulating user clicking email link)
  const getVerifyUrl = `http://localhost:5000/api/verify-email?token=${token}`;
  const getResponse = await fetch(getVerifyUrl, { 
    method: 'GET',
    redirect: 'manual'
  });
  
  console.log('3. GET verification test:');
  console.log('   Status:', getResponse.status);
  console.log('   Redirect:', getResponse.headers.get('location'));
  
  // Check if user is verified
  const { data: verifiedUser } = await supabase
    .from('user_profiles')
    .select('email_verified, email_verification_token')
    .eq('id', user.id)
    .single();
    
  console.log('4. Verification result:');
  console.log('   Email verified:', verifiedUser.email_verified);
  console.log('   Token cleared:', !verifiedUser.email_verification_token);
  
  // Test resend verification (should generate new token)
  const resendResponse = await fetch('http://localhost:5000/api/send-verification-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      userId: user.id
    })
  });
  
  console.log('5. Resend verification:', resendResponse.ok ? 'Success' : 'Failed');
  
  // Check new token generated
  const { data: resentUser } = await supabase
    .from('user_profiles')
    .select('email_verification_token, email_verified')
    .eq('id', user.id)
    .single();
    
  console.log('6. After resend:');
  console.log('   New token generated:', !!resentUser.email_verification_token);
  console.log('   Verification reset:', !resentUser.email_verified);
  
  // Test new token with GET route
  const newGetResponse = await fetch(`http://localhost:5000/api/verify-email?token=${resentUser.email_verification_token}`, {
    method: 'GET',
    redirect: 'manual'
  });
  
  console.log('7. New token verification:', newGetResponse.status === 302 ? 'Success' : 'Failed');
  
  // Final verification status
  const { data: finalUser } = await supabase
    .from('user_profiles')
    .select('email_verified, email_verification_token')
    .eq('id', user.id)
    .single();
    
  console.log('8. Final status:');
  console.log('   Email verified:', finalUser.email_verified);
  console.log('   Token cleared:', !finalUser.email_verification_token);
  
  return finalUser.email_verified && !finalUser.email_verification_token;
}

testCompleteEmailFlow().then(success => {
  console.log('\n=== COMPLETE EMAIL VERIFICATION FLOW ===');
  console.log(success ? 'ALL SYSTEMS WORKING PERFECTLY' : 'ISSUES DETECTED');
}).catch(error => {
  console.error('Flow test error:', error);
});