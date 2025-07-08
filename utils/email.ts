import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(to: string, link: string) {
  try {
    console.log('Attempting to send verification email to:', to);
    console.log('Verification link:', link);
    console.log("Resend key present:", !!process.env.RESEND_API_KEY);
    
    const response = await resend.emails.send({
      from: 'FitlyAI <no-reply@fitlyai.com>',
      to,
      subject: 'Verify your FitlyAI account',
      html: `
        <div style="font-family:sans-serif; padding:20px;">
          <h2>Welcome to FitlyAI!</h2>
          <p>Click the button below to verify your email address:</p>
          <a href="${link}" style="display:inline-block;padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:4px;">Verify Email</a>
          <p>If you didn't sign up, you can safely ignore this email.</p>
        </div>
      `,
    });

    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Email sending failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return { error };
  }
}