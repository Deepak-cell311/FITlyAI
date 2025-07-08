async function testCompleteResendFlow() {
  console.log('Testing complete Resend email flow...');
  
  const testEmail = `resendtest${Date.now()}@gmail.com`;
  
  try {
    // Test signup which should trigger email sending
    console.log('1. Testing signup with email sending...');
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
    
    const signupResult = await signupResponse.json();
    console.log('   Signup response:', signupResult);
    
    // Wait for email processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test resend verification email
    console.log('2. Testing resend verification email...');
    const resendResponse = await fetch('http://localhost:5000/api/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail
      })
    });
    
    const resendResult = await resendResponse.json();
    console.log('   Resend response:', resendResult);
    
    return signupResponse.ok && resendResponse.ok;
    
  } catch (error) {
    console.error('Test error:', error);
    return false;
  }
}

testCompleteResendFlow().then(success => {
  console.log('\n=== RESEND EMAIL FLOW TEST ===');
  console.log(success ? '✓ Email verification system working correctly' : '✗ Email verification system has issues');
}).catch(error => {
  console.error('Complete test error:', error);
});