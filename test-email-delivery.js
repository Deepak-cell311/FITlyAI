const fetch = require('node-fetch');

async function testEmailDelivery() {
  console.log('Testing email delivery with verified domain...');
  
  const testEmail = 'aarshad.amir@gmail.com'; // Your actual email
  
  try {
    // Test signup which triggers email
    const signupResponse = await fetch('http://localhost:5000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!',
        first_name: 'Email',
        last_name: 'DeliveryTest'
      })
    });
    
    const result = await signupResponse.json();
    console.log('Signup response:', result);
    
    if (signupResponse.ok) {
      console.log('✓ Signup successful - email should be sent with verified domain');
      console.log('Check your email (including spam folder) for verification email');
      console.log('From: FitlyAI <onboarding@resend.dev>');
      console.log('Subject: Verify Your FitlyAI Account');
    } else {
      console.log('✗ Signup failed:', result);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testEmailDelivery();