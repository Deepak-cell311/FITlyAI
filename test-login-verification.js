import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testLoginVerificationRequirement() {
  console.log('Testing login email verification requirement...');
  
  const testEmail = `logintest${Date.now()}@gmail.com`;
  const testPassword = 'SecurePassword123!@#';
  
  try {
    // Step 1: Create unverified user
    console.log('1. Creating unverified user...');
    const signupResponse = await fetch('http://localhost:5000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        first_name: 'Login',
        last_name: 'Test'
      })
    });
    
    if (!signupResponse.ok) {
      console.error('Signup failed:', await signupResponse.json());
      return false;
    }
    
    console.log('   ✓ Unverified user created');
    
    // Wait for database writes
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Try to login with unverified account
    console.log('2. Attempting login with unverified account...');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (authError) {
      console.error('Auth login failed:', authError.message);
      return false;
    }
    
    // Step 3: Try to verify with backend (should fail)
    console.log('3. Testing backend verification (should be blocked)...');
    
    const verifyResponse = await fetch('http://localhost:5000/api/auth/supabase-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: authData.session.access_token })
    });
    
    const verifyResult = await verifyResponse.json();
    
    if (verifyResponse.status === 403) {
      console.log('   ✓ Login blocked - email verification required');
      console.log('   Message:', verifyResult.message);
    } else {
      console.log('   ✗ Login allowed (should have been blocked)');
      console.log('   Status:', verifyResponse.status);
      console.log('   Response:', verifyResult);
      return false;
    }
    
    // Step 4: Verify email and try login again
    console.log('4. Verifying email and testing login again...');
    
    // Get the auth user and their verification token
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find(u => u.email === testEmail);
    
    if (!authUser) {
      console.error('Auth user not found for verification');
      return false;
    }
    
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('email_verification_token')
      .eq('id', authUser.id)
      .single();
    
    if (!userProfile?.email_verification_token) {
      console.error('No verification token found');
      return false;
    }
    
    // Verify email
    const emailVerifyResponse = await fetch(`http://localhost:5000/api/verify-email?token=${userProfile.email_verification_token}`, {
      method: 'GET'
    });
    
    if (emailVerifyResponse.status !== 302) {
      console.error('Email verification failed');
      return false;
    }
    
    console.log('   ✓ Email verified successfully');
    
    // Step 5: Try login again (should succeed)
    console.log('5. Testing login with verified account...');
    
    const secondVerifyResponse = await fetch('http://localhost:5000/api/auth/supabase-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: authData.session.access_token })
    });
    
    if (secondVerifyResponse.ok) {
      const userData = await secondVerifyResponse.json();
      console.log('   ✓ Login successful after email verification');
      console.log('   User:', userData.user.email);
      return true;
    } else {
      console.log('   ✗ Login still blocked after verification');
      console.log('   Status:', secondVerifyResponse.status);
      console.log('   Response:', await secondVerifyResponse.json());
      return false;
    }
    
  } catch (error) {
    console.error('Test error:', error);
    return false;
  }
}

testLoginVerificationRequirement().then(success => {
  console.log('\n=== LOGIN VERIFICATION TEST ===');
  console.log(success ? '✅ Email verification requirement working correctly' : '❌ Login verification test failed');
}).catch(error => {
  console.error('Login verification test error:', error);
});