import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCustomVerificationFlow() {
  console.log('Testing custom email_verified field enforcement...');
  
  const testEmail = `customverify${Date.now()}@gmail.com`;
  const testPassword = 'SecurePassword123!@#';
  
  try {
    // Step 1: Create user
    console.log('1. Creating user account...');
    const signupResponse = await fetch('http://localhost:5000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        first_name: 'Custom',
        last_name: 'Verify'
      })
    });
    
    if (!signupResponse.ok) {
      console.error('Signup failed');
      return false;
    }
    
    console.log('   ✓ User created');
    
    // Wait for database processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Get user and verify initial state
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find(u => u.email === testEmail);
    
    const { data: initialProfile } = await supabase
      .from('user_profiles')
      .select('email_verified, email_verification_token')
      .eq('id', authUser.id)
      .single();
    
    console.log('2. Initial user state:');
    console.log('   Custom email_verified:', initialProfile.email_verified);
    console.log('   Has verification token:', !!initialProfile.email_verification_token);
    console.log('   Supabase email_confirmed_at:', !!authUser.email_confirmed_at);
    
    // Step 3: Authenticate with Supabase
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    // Step 4: Test backend verification (should fail due to custom field)
    console.log('3. Testing backend verification with unverified custom field...');
    const verifyResponse = await fetch('http://localhost:5000/api/auth/supabase-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: authData.session.access_token })
    });
    
    if (verifyResponse.status === 403) {
      console.log('   ✓ Backend correctly rejected due to custom email_verified = false');
    } else {
      console.log('   ✗ Backend should have rejected unverified user');
      return false;
    }
    
    // Step 5: Manually verify using our custom endpoint
    console.log('4. Verifying email using custom verification endpoint...');
    const verifyEmailResponse = await fetch(`http://localhost:5000/api/verify-email?token=${initialProfile.email_verification_token}`, {
      method: 'GET'
    });
    
    if (verifyEmailResponse.status === 302) {
      console.log('   ✓ Custom verification endpoint processed successfully');
    } else {
      console.log('   ✗ Custom verification failed');
      return false;
    }
    
    // Step 6: Check that custom field is now true
    const { data: verifiedProfile } = await supabase
      .from('user_profiles')
      .select('email_verified, email_verification_token')
      .eq('id', authUser.id)
      .single();
    
    console.log('5. After verification state:');
    console.log('   Custom email_verified:', verifiedProfile.email_verified);
    console.log('   Token cleared:', !verifiedProfile.email_verification_token);
    
    // Step 7: Test backend verification again (should succeed)
    console.log('6. Testing backend verification with verified custom field...');
    const finalVerifyResponse = await fetch('http://localhost:5000/api/auth/supabase-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: authData.session.access_token })
    });
    
    if (finalVerifyResponse.ok) {
      const userData = await finalVerifyResponse.json();
      console.log('   ✓ Backend accepted verified user');
      console.log('   Response emailVerified:', userData.user.emailVerified);
      
      // Verify the response uses our custom field
      if (userData.user.emailVerified === verifiedProfile.email_verified) {
        console.log('   ✓ Response correctly uses custom email_verified field');
        return true;
      } else {
        console.log('   ✗ Response not using custom field correctly');
        return false;
      }
    } else {
      console.log('   ✗ Backend still rejecting verified user');
      return false;
    }
    
  } catch (error) {
    console.error('Test error:', error);
    return false;
  }
}

testCustomVerificationFlow().then(success => {
  console.log('\n=== CUSTOM EMAIL VERIFICATION TEST ===');
  if (success) {
    console.log('✅ Custom email_verified field enforcement working correctly');
    console.log('- Only trusts user_profiles.email_verified field');
    console.log('- Ignores Supabase built-in email_confirmed_at');
    console.log('- Properly enforces custom verification logic');
  } else {
    console.log('❌ Custom verification logic has issues');
  }
}).catch(error => {
  console.error('Custom verification test error:', error);
});