import { Resend } from 'resend';
import { verifyEmailTemplate } from './templates/verifyEmailTemplate';

let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    console.log("Resend key loaded:", !!process.env.RESEND_API_KEY);
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Missing required environment variable: RESEND_API_KEY');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private fromEmail = 'FitlyAI <no-reply@fitlyai.com>';

  async sendEmail({ to, subject, html, from }: EmailOptions) {
    try {
      const resendClient = getResendClient();
      console.log('Attempting to send email to:', to);
      console.log('From:', from || this.fromEmail);
      console.log('Subject:', subject);
      
      const { data, error } = await resendClient.emails.send({
        from: from || this.fromEmail,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error('Email sending failed:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log('Email sent successfully with ID:', data?.id);
      console.log('Full response:', { data, error });
      return data;
    } catch (error: any) {
      console.error('Email service error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, firstName: string) {
    const subject = 'Welcome to FitlyAI - Your AI Fitness Journey Starts Now!';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">FitlyAI</h1>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Your Personal AI Fitness Coach</p>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome, ${firstName}!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining FitlyAI! You're now part of a community that's transforming their health and fitness with the power of AI.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">What's Next?</h3>
              <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Complete your fitness profile</li>
                <li>Set your health and fitness goals</li>
                <li>Start chatting with your AI coach</li>
                <li>Get personalized workout and nutrition plans</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://www.fitlyai.com" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                Start Your Journey
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                <strong>Important:</strong> FitlyAI provides general fitness guidance. Always consult with healthcare professionals for medical advice.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2025 FitlyAI. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendPasswordResetEmail(to: string, resetLink: string, firstName: string) {
    const subject = 'Reset Your FitlyAI Password';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">FitlyAI</h1>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Password Reset Request</p>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${firstName},</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your FitlyAI password. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              This link will expire in 1 hour for security purposes.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2025 FitlyAI. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendVerificationEmail(to: string, verificationLink: string, firstName?: string) {
    const subject = 'Verify Your FitlyAI Account';
    
    // Extract token from verification link for template
    const tokenMatch = verificationLink.match(/token=([^&]+)/);
    const token = tokenMatch ? tokenMatch[1] : '';
    
    const html = verifyEmailTemplate(token);

    return this.sendEmail({ to, subject, html });
  }

  async sendSubscriptionConfirmationEmail(to: string, firstName: string, planName: string, amount: string) {
    const subject = `Welcome to FitlyAI ${planName} - Let's Transform Your Fitness!`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">FitlyAI</h1>
              <p style="color: #16a34a; margin: 5px 0 0 0; font-weight: 500;">Subscription Activated!</p>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Congratulations, ${firstName}!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Your ${planName} subscription has been successfully activated. You now have access to all premium features!
            </p>
            
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #16a34a; margin-top: 0;">Your ${planName} Benefits:</h3>
              <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
                ${planName === 'Premium' ? `
                  <li>Unlimited AI messages and conversations</li>
                  <li>Full dashboard access</li>
                  <li>Personalized workout plans</li>
                  <li>Nutrition guidance</li>
                ` : `
                  <li>Everything in Premium</li>
                  <li>Advanced macro and calorie tracking</li>
                  <li>Detailed progress analytics</li>
                  <li>Priority support</li>
                `}
              </ul>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #374151; margin: 0; font-size: 14px;">
                <strong>Subscription:</strong> ${planName} Plan<br>
                <strong>Amount:</strong> $${amount}/month<br>
                <strong>Next billing:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://www.fitlyai.com" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                Access Your Dashboard
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2025 FitlyAI. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }
}

export const emailService = new EmailService();