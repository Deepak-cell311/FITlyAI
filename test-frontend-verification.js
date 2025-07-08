import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testFrontendVerification() {
  console.log('Testing frontend verification page...');
  
  // Create a test user for frontend verification
  const signupResponse = await fetch('http://localhost:5000/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `frontend${Date.now()}@gmail.com`,
      password: 'SecurePassword123!@#',
      first_name: 'Frontend',
      last_name: 'Verification'
    })
  });
  
  if (!signupResponse.ok) {
    console.error('Signup failed');
    return;
  }
  
  // Wait for database write
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get the verification token
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('email_verification_token')
    .eq('first_name', 'Frontend')
    .eq('last_name', 'Verification')
    .single();
    
  const token = profile.email_verification_token;
  console.log('Generated verification token:', token);
  
  // Test the verification URL that would be sent in the email
  const verificationUrl = `https://www.fitlyai.com/verify?token=${token}`;
  console.log('Verification URL:', verificationUrl);
  
  // Test the actual verification endpoint that the frontend would call
  const frontendResponse = await fetch('http://localhost:5000/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  
  const result = await frontendResponse.json();
  
  if (frontendResponse.ok) {
    console.log('✓ Frontend verification endpoint working');
    console.log('Response:', result.message);
    
    // Verify the user is now marked as verified
    const { data: verifiedProfile } = await supabase
      .from('user_profiles')
      .select('email_verified, email_verification_token')
      .eq('first_name', 'Frontend')
      .eq('last_name', 'Verification')
      .single();
      
    if (verifiedProfile.email_verified && !verifiedProfile.email_verification_token) {
      console.log('✓ User verification status correctly updated');
      return true;
    } else {
      console.log('✗ User verification status not updated');
      return false;
    }
  } else {
    console.log('✗ Frontend verification failed:', result);
    return false;
  }
}

testFrontendVerification().then(success => {
  console.log('\n=== FRONTEND VERIFICATION TEST ===');
  console.log(success ? '✓ Frontend verification working correctly' : '✗ Frontend verification failed');
}).catch(error => {
  console.error('Frontend test error:', error);
});