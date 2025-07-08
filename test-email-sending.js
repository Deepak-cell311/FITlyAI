async function testEmailSending() {
  console.log('Testing email sending functionality...');
  
  const testEmail = `emailtest${Date.now()}@gmail.com`;
  
  try {
    // Test signup which should trigger email sending
    console.log('1. Creating new user to test email sending...');
    const signupResponse = await fetch('http://localhost:5000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePassword123!@#',
        first_name: 'Email',
        last_name: 'Test'
      })
    });
    
    const signupResult = await signupResponse.json();
    
    if (signupResponse.ok) {
      console.log('   ✓ Signup successful');
      console.log('   Message:', signupResult.message);
    } else {
      console.log('   ✗ Signup failed:', signupResult.error);
      return false;
    }
    
    // Test direct email sending endpoint
    console.log('2. Testing direct email sending endpoint...');
    const emailResponse = await fetch('http://localhost:5000/api/send-verification-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        userId: 'test-user-id',
        token: 'test-token-12345'
      })
    });
    
    const emailResult = await emailResponse.json();
    
    if (emailResponse.ok) {
      console.log('   ✓ Email endpoint successful');
      console.log('   Message:', emailResult.message);
    } else {
      console.log('   ✗ Email endpoint failed:', emailResult.error);
    }
    
    return true;
    
  } catch (error) {
    console.error('Test error:', error);
    return false;
  }
}

testEmailSending().then(success => {
  console.log('\n=== EMAIL SENDING TEST ===');
  console.log(success ? 'Email testing completed - check server logs for Resend API details' : 'Email testing failed');
}).catch(error => {
  console.error('Email test error:', error);
});