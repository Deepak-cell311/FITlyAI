import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testDirectLoginEndpoint() {
  console.log('Testing direct POST /api/auth/login endpoint...');
  
  const testEmail = `directlogin${Date.now()}@gmail.com`;
  const testPassword = 'SecurePassword123!@#';
  
  try {
    // 1. Create unverified user via signup
    console.log('1. Creating unverified user...');
    const signupResponse = await fetch('http://localhost:5000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        first_name: 'Direct',
        last_name: 'Login'
      })
    });
    
    if (!signupResponse.ok) {
      console.error('Signup failed');
      return false;
    }
    
    console.log('   ✓ User created');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. Test direct login with unverified user (should fail)
    console.log('2. Testing direct login with unverified user...');
    const unverifiedLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    if (unverifiedLoginResponse.status === 403) {
      const result = await unverifiedLoginResponse.json();
      console.log('   ✓ Unverified login blocked:', result.error);
    } else {
      console.log('   ✗ Should have blocked unverified user');
      return false;
    }
    
    // 3. Verify user manually and test login again
    console.log('3. Verifying user and testing login again...');
    
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find(u => u.email === testEmail);
    
    // Set user as verified
    await supabase
      .from('user_profiles')
      .update({ email_verified: true, email_verification_token: null })
      .eq('id', authUser.id);
    
    // Try login again (should succeed)
    const verifiedLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    if (verifiedLoginResponse.ok) {
      const userData = await verifiedLoginResponse.json();
      console.log('   ✓ Verified login successful');
      console.log('   User email:', userData.user.email);
      console.log('   Email verified:', userData.user.emailVerified);
      
      return userData.user.emailVerified === true;
    } else {
      console.log('   ✗ Verified login failed');
      const errorData = await verifiedLoginResponse.json();
      console.log('   Error:', errorData);
      return false;
    }
    
  } catch (error) {
    console.error('Test error:', error);
    return false;
  }
}

testDirectLoginEndpoint().then(success => {
  console.log('\n=== DIRECT LOGIN ENDPOINT TEST ===');
  if (success) {
    console.log('✅ POST /api/auth/login endpoint working correctly');
    console.log('- Blocks unverified users with 403 status');
    console.log('- Allows verified users to login');
    console.log('- Uses custom email_verified field properly');
  } else {
    console.log('❌ Direct login endpoint has issues');
  }
}).catch(error => {
  console.error('Direct login test error:', error);
});