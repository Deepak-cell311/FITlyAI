import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCompleteFlow() {
  // Create a new test user
  const testEmail = `verify${Date.now()}@gmail.com`;
  
  console.log('Testing complete email verification flow...');
  console.log('1. Creating new user account...');
  
  const signupResponse = await fetch('http://localhost:5000/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'SecurePassword123!@#',
      first_name: 'Verify',
      last_name: 'Test'
    })
  });
  
  const signupResult = await signupResponse.json();
  console.log('Signup result:', signupResult);
  
  if (!signupResponse.ok) {
    console.error('Signup failed');
    return;
  }
  
  // Wait a moment for database write
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('2. Fetching user profile and verification token...');
  
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('first_name', 'Verify')
    .eq('last_name', 'Test')
    .single();
    
  if (error) {
    console.error('Error fetching profile:', error);
    return;
  }
  
  console.log('User profile created:');
  console.log('- ID:', profile.id);
  console.log('- Email verified:', profile.email_verified);
  console.log('- Token exists:', !!profile.email_verification_token);
  
  const token = profile.email_verification_token;
  
  console.log('3. Testing verification endpoint...');
  
  const verifyResponse = await fetch('http://localhost:5000/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  
  const verifyResult = await verifyResponse.json();
  console.log('Verification result:', verifyResult);
  
  if (verifyResponse.ok) {
    console.log('✓ Email verification successful');
    
    // Check updated profile
    const { data: updatedProfile } = await supabase
      .from('user_profiles')
      .select('email_verified, email_verification_token')
      .eq('id', profile.id)
      .single();
      
    console.log('4. Verification status updated:');
    console.log('- Email verified:', updatedProfile.email_verified);
    console.log('- Token cleared:', !updatedProfile.email_verification_token);
    
    if (updatedProfile.email_verified && !updatedProfile.email_verification_token) {
      console.log('✓ Complete verification flow working perfectly!');
      
      // Test verification URL format
      const verificationUrl = `https://www.fitlyai.com/verify?token=${token}`;
      console.log('5. Verification URL format:', verificationUrl);
      
      return true;
    } else {
      console.log('✗ Verification status not properly updated');
      return false;
    }
  } else {
    console.log('✗ Email verification failed');
    return false;
  }
}

testCompleteFlow().then(success => {
  console.log('\n=== TEST SUMMARY ===');
  console.log(success ? '✓ All tests passed' : '✗ Tests failed');
}).catch(error => {
  console.error('Test error:', error);
});