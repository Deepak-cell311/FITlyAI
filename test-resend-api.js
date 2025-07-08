import { sendVerificationEmail } from './utils/email.ts';

async function testResendAPI() {
  console.log('Testing Resend API directly...');
  
  try {
    const result = await sendVerificationEmail(
      'test@example.com', 
      'https://www.fitlyai.com/api/verify-email?token=test123'
    );
    
    console.log('Resend API result:', result);
    
    if (result.error) {
      console.log('Email sending failed with error:', result.error);
      return false;
    } else {
      console.log('Email sent successfully');
      return true;
    }
  } catch (error) {
    console.error('Test error:', error);
    return false;
  }
}

testResendAPI().then(success => {
  console.log('\n=== RESEND API TEST ===');
  console.log(success ? 'Resend API working correctly' : 'Resend API has issues');
}).catch(error => {
  console.error('Resend test error:', error);
});