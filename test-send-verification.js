import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testSendVerificationRoute() {
  console.log('Testing /send-verification-email route...');
  
  // First create a test user
  const testEmail = `resend${Date.now()}@gmail.com`;
  
  const signupResponse = await fetch('http://localhost:5000/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'SecurePassword123!@#',
      first_name: 'Resend',
      last_name: 'Test'
    })
  });
  
  if (!signupResponse.ok) {
    console.error('Signup failed');
    return false;
  }
  
  // Wait for database write
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get the user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('first_name', 'Resend')
    .eq('last_name', 'Test')
    .single();
    
  const userId = profile.id;
  const originalToken = profile.email_verification_token;
  
  console.log('User created with ID:', userId);
  console.log('Original token:', originalToken);
  
  // Test the new send verification email route
  const resendResponse = await fetch('http://localhost:5000/api/send-verification-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      userId: userId
    })
  });
  
  const resendResult = await resendResponse.json();
  console.log('Resend response:', resendResult);
  
  if (resendResponse.ok) {
    console.log('✓ Verification email resent successfully');
    
    // Check if token was updated
    const { data: updatedProfile } = await supabase
      .from('user_profiles')
      .select('email_verification_token, email_verified')
      .eq('id', userId)
      .single();
      
    const newToken = updatedProfile.email_verification_token;
    
    console.log('New token:', newToken);
    console.log('Token changed:', originalToken !== newToken);
    console.log('Email verified status reset:', !updatedProfile.email_verified);
    
    if (originalToken !== newToken && !updatedProfile.email_verified) {
      console.log('✓ Token regenerated and verification status reset correctly');
      
      // Test the new token works for verification
      const verifyResponse = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: newToken })
      });
      
      if (verifyResponse.ok) {
        console.log('✓ New token works for verification');
        return true;
      } else {
        console.log('✗ New token failed verification');
        return false;
      }
    } else {
      console.log('✗ Token not properly regenerated');
      return false;
    }
  } else {
    console.log('✗ Failed to resend verification email');
    return false;
  }
}

testSendVerificationRoute().then(success => {
  console.log('\n=== RESEND VERIFICATION TEST ===');
  console.log(success ? '✓ Send verification email route working correctly' : '✗ Send verification route failed');
}).catch(error => {
  console.error('Test error:', error);
});