import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testGetVerifyRoute() {
  console.log('Testing GET /verify-email route...');
  
  // Create test user
  const testEmail = `getverify${Date.now()}@gmail.com`;
  
  const signupResponse = await fetch('http://localhost:5000/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'SecurePassword123!@#',
      first_name: 'GetVerify',
      last_name: 'Test'
    })
  });
  
  console.log('1. User signup:', signupResponse.ok ? 'Success' : 'Failed');
  
  // Wait for database write
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Get user token
  const { data: user } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('first_name', 'GetVerify')
    .eq('last_name', 'Test')
    .single();
    
  if (!user) {
    console.error('User not found');
    return false;
  }
  
  const token = user.email_verification_token;
  console.log('2. User created with token:', !!token);
  console.log('   Initial verification status:', user.email_verified);
  
  // Test GET verification route
  const verifyUrl = `http://localhost:5000/api/verify-email?token=${token}`;
  console.log('3. Testing GET verification URL:', verifyUrl);
  
  try {
    const verifyResponse = await fetch(verifyUrl, {
      method: 'GET',
      redirect: 'manual' // Don't follow redirects so we can check the response
    });
    
    console.log('4. GET verification response:');
    console.log('   Status:', verifyResponse.status);
    console.log('   Redirect location:', verifyResponse.headers.get('location'));
    
    // Check if user is now verified
    const { data: verifiedUser } = await supabase
      .from('user_profiles')
      .select('email_verified, email_verification_token')
      .eq('id', user.id)
      .single();
      
    console.log('5. After GET verification:');
    console.log('   Email verified:', verifiedUser.email_verified);
    console.log('   Token cleared:', !verifiedUser.email_verification_token);
    console.log('   Redirect to:', verifyResponse.headers.get('location'));
    
    // Success if user is verified and redirected properly
    const isSuccess = verifiedUser.email_verified && 
                     !verifiedUser.email_verification_token && 
                     verifyResponse.status === 302 &&
                     verifyResponse.headers.get('location') === 'https://www.fitlyai.com/login?verified=true';
    
    return isSuccess;
    
  } catch (error) {
    console.error('GET verification error:', error);
    return false;
  }
}

// Test invalid token
async function testInvalidToken() {
  console.log('\n6. Testing invalid token...');
  
  const invalidUrl = 'http://localhost:5000/api/verify-email?token=invalid-token-123';
  
  try {
    const response = await fetch(invalidUrl, { method: 'GET' });
    const result = await response.json();
    
    console.log('   Invalid token response:', result.error);
    console.log('   Status:', response.status);
    
    return response.status === 400 && result.error;
  } catch (error) {
    console.error('Invalid token test error:', error);
    return false;
  }
}

async function runAllTests() {
  const getVerifySuccess = await testGetVerifyRoute();
  const invalidTokenSuccess = await testInvalidToken();
  
  console.log('\n=== GET VERIFY EMAIL ROUTE TEST ===');
  console.log('Valid token test:', getVerifySuccess ? 'PASSED' : 'FAILED');
  console.log('Invalid token test:', invalidTokenSuccess ? 'PASSED' : 'FAILED');
  console.log('Overall result:', (getVerifySuccess && invalidTokenSuccess) ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');
}

runAllTests().catch(error => {
  console.error('Test suite error:', error);
});