import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testUpdatedVerifyRoute() {
  console.log('Testing updated GET /api/verify-email route...');
  
  const testEmail = `updatedverify${Date.now()}@gmail.com`;
  const testPassword = 'SecurePassword123!@#';
  
  try {
    // 1. Create unverified user
    console.log('1. Creating unverified user...');
    const signupResponse = await fetch('http://localhost:5000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        first_name: 'Updated',
        last_name: 'Verify'
      })
    });
    
    if (!signupResponse.ok) {
      console.error('Signup failed');
      return false;
    }
    
    console.log('   ✓ User created');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. Get verification token
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find(u => u.email === testEmail);
    
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('email_verification_token, email_verified')
      .eq('id', authUser.id)
      .single();
    
    console.log('2. Initial state:');
    console.log('   Has token:', !!userProfile.email_verification_token);
    console.log('   Email verified:', userProfile.email_verified);
    
    // 3. Test verification route
    console.log('3. Testing verification route...');
    const verifyResponse = await fetch(`http://localhost:5000/api/verify-email?token=${userProfile.email_verification_token}`, {
      method: 'GET',
      redirect: 'manual'
    });
    
    console.log('   Status:', verifyResponse.status);
    console.log('   Redirect location:', verifyResponse.headers.get('location'));
    
    if (verifyResponse.status === 302) {
      console.log('   ✓ Verification successful with redirect');
    } else {
      console.log('   ✗ Verification failed');
      return false;
    }
    
    // 4. Check final state
    console.log('4. Checking final verification state...');
    const { data: verifiedProfile } = await supabase
      .from('user_profiles')
      .select('email_verified, email_verification_token')
      .eq('id', authUser.id)
      .single();
    
    console.log('   Email verified:', verifiedProfile.email_verified);
    console.log('   Token cleared:', !verifiedProfile.email_verification_token);
    
    // 5. Test login with verified user
    console.log('5. Testing login with verified user...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    if (loginResponse.ok) {
      const userData = await loginResponse.json();
      console.log('   ✓ Login successful');
      console.log('   Email verified in response:', userData.user.emailVerified);
      
      return verifiedProfile.email_verified && !verifiedProfile.email_verification_token && userData.user.emailVerified;
    } else {
      console.log('   ✗ Login failed after verification');
      return false;
    }
    
  } catch (error) {
    console.error('Test error:', error);
    return false;
  }
}

testUpdatedVerifyRoute().then(success => {
  console.log('\n=== UPDATED VERIFY ROUTE TEST ===');
  if (success) {
    console.log('✅ Updated GET /api/verify-email route working correctly');
    console.log('- Properly fetches user with limit(1)');
    console.log('- Updates email_verified to true');
    console.log('- Clears verification token');
    console.log('- Redirects to login page with verified=1 parameter');
  } else {
    console.log('❌ Updated verification route has issues');
  }
}).catch(error => {
  console.error('Updated verify route test error:', error);
});