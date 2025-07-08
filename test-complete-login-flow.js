import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCompleteLoginFlow() {
  console.log('Testing complete login verification flow...');
  
  const testEmail = `completeflow${Date.now()}@gmail.com`;
  const testPassword = 'SecurePassword123!@#';
  
  try {
    // Step 1: Signup creates unverified user
    console.log('1. Creating new user account...');
    const signupResponse = await fetch('http://localhost:5000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        first_name: 'Complete',
        last_name: 'Flow'
      })
    });
    
    if (!signupResponse.ok) {
      console.error('Signup failed');
      return false;
    }
    
    console.log('   ✓ User account created');
    
    // Wait for database processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Authenticate with Supabase (should work)
    console.log('2. Testing Supabase authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (authError || !authData.session) {
      console.error('Supabase auth failed:', authError?.message);
      return false;
    }
    
    console.log('   ✓ Supabase authentication successful');
    
    // Step 3: Backend verification should fail
    console.log('3. Testing backend verification (should be blocked)...');
    const verifyResponse = await fetch('http://localhost:5000/api/auth/supabase-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: authData.session.access_token })
    });
    
    if (verifyResponse.status === 403) {
      const result = await verifyResponse.json();
      console.log('   ✓ Backend correctly blocked unverified user');
      console.log('   Message:', result.message);
    } else {
      console.log('   ✗ Backend should have blocked unverified user');
      return false;
    }
    
    // Step 4: Verify email using direct endpoint
    console.log('4. Verifying email address...');
    
    // Get verification token from database
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find(u => u.email === testEmail);
    
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('email_verification_token, email_verified')
      .eq('id', authUser.id)
      .single();
    
    console.log('   Initial verification status:', userProfile.email_verified);
    console.log('   Token length:', userProfile.email_verification_token?.length);
    
    // Verify email
    const emailVerifyResponse = await fetch(`http://localhost:5000/api/verify-email?token=${userProfile.email_verification_token}`, {
      method: 'GET'
    });
    
    if (emailVerifyResponse.status === 302) {
      console.log('   ✓ Email verification successful');
    } else {
      console.log('   ✗ Email verification failed');
      return false;
    }
    
    // Step 5: Backend verification should now succeed
    console.log('5. Testing backend verification after email verification...');
    
    const finalVerifyResponse = await fetch('http://localhost:5000/api/auth/supabase-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: authData.session.access_token })
    });
    
    if (finalVerifyResponse.ok) {
      const userData = await finalVerifyResponse.json();
      console.log('   ✓ Backend verification successful after email verification');
      console.log('   User email:', userData.user.email);
      console.log('   Email verified status:', userData.user.emailVerified);
      return true;
    } else {
      console.log('   ✗ Backend verification still failing');
      console.log('   Status:', finalVerifyResponse.status);
      const errorData = await finalVerifyResponse.json();
      console.log('   Error:', errorData.message);
      return false;
    }
    
  } catch (error) {
    console.error('Test error:', error);
    return false;
  }
}

testCompleteLoginFlow().then(success => {
  console.log('\n=== COMPLETE LOGIN VERIFICATION FLOW ===');
  if (success) {
    console.log('✅ Complete flow working correctly:');
    console.log('  - Signup creates unverified users');
    console.log('  - Unverified users blocked from backend access');
    console.log('  - Email verification enables backend access');
    console.log('  - Login security properly enforced');
  } else {
    console.log('❌ Login verification flow has issues');
  }
}).catch(error => {
  console.error('Complete flow test error:', error);
});