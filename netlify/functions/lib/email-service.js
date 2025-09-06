import { Resend } from 'resend';

// Initialize Resend with fallback for testing
const resend = new Resend(process.env.RESEND_API_KEY || 'test_key');

// Email templates
export const EMAIL_TEMPLATES = {
  CONTACT_INQUIRY: {
    to: 'ivan@peycheff.com',
    subject: (inquiry) => `New Inquiry from ${inquiry.name} - ${inquiry.company || 'Individual'}`,
    html: (inquiry) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0A84FF 0%, #007AFF 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">New Contact Inquiry</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">peycheff.com</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Contact Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500; width: 100px;">Name:</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-weight: 600;">${inquiry.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Email:</td>
              <td style="padding: 8px 0;">
                <a href="mailto:${inquiry.email}" style="color: #0A84FF; text-decoration: none;">${inquiry.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">LinkedIn:</td>
              <td style="padding: 8px 0;">
                <a href="${inquiry.linkedin}" style="color: #0A84FF; text-decoration: none;" target="_blank">${inquiry.linkedin}</a>
              </td>
            </tr>
            ${inquiry.company ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Company:</td>
              <td style="padding: 8px 0; color: #1a1a1a;">${inquiry.company}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Timeline:</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-weight: 600;">${inquiry.timeline}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Budget:</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-weight: 600;">${inquiry.budget}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: white; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Problem Description</h2>
          <p style="color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap;">${inquiry.problem}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${inquiry.email}?subject=Re: Your inquiry about ${inquiry.company || 'your project'}" 
             style="background: #0A84FF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Reply to ${inquiry.name}
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 14px;">
          <p>Received at ${new Date().toLocaleString('en-US', { 
            timeZone: 'America/New_York',
            dateStyle: 'full',
            timeStyle: 'short'
          })}</p>
        </div>
      </div>
    `
  },

  CONTACT_CONFIRMATION: {
    subject: "Thanks for reaching out - I'll reply within 24 hours",
    html: (inquiry) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0A84FF 0%, #007AFF 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Thanks, ${inquiry.name}!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px;">I'll review your inquiry and reply within 24 hours.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What I received:</h2>
          <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #0A84FF;">
            <p style="color: #374151; line-height: 1.6; margin: 0; font-style: italic;">"${inquiry.problem.length > 200 ? inquiry.problem.substring(0, 200) + '...' : inquiry.problem}"</p>
          </div>
          <div style="margin-top: 15px; font-size: 14px; color: #6b7280;">
            <strong>Timeline:</strong> ${inquiry.timeline} • <strong>Budget:</strong> ${inquiry.budget}
          </div>
        </div>
        
        <div style="background: white; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What happens next?</h2>
          <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">I'll review your inquiry and research your background</li>
            <li style="margin-bottom: 8px;">If it's a good fit, I'll reply with next steps within 24 hours</li>
            <li style="margin-bottom: 8px;">For complex projects, I might suggest a quick call to clarify details</li>
            <li>All initial conversations are free - no commitment required</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #6b7280;">
          <p style="margin: 0 0 10px 0;">Need to add something? Just reply to this email.</p>
          <p style="margin: 0; font-size: 14px;">
            Ivan Peycheff<br>
            <a href="mailto:ivan@peycheff.com" style="color: #0A84FF; text-decoration: none;">ivan@peycheff.com</a>
          </p>
        </div>
      </div>
    `
  },

  NEWSLETTER_WELCOME: {
    subject: "Welcome to Build Notes - Your first insights inside",
    html: (subscriber) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 40px 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 600;">Welcome to Build Notes</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 15px 0 0 0; font-size: 18px;">Systems thinking for builders who ship.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">What you'll get:</h2>
          
          <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
            <div style="background: #0A84FF; width: 6px; height: 6px; border-radius: 50%; margin: 8px 15px 0 0; flex-shrink: 0;"></div>
            <div>
              <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">2 operator memos per month</h3>
              <p style="margin: 0; color: #6b7280; line-height: 1.5;">Distilled insights from building products, running teams, and designing systems that scale.</p>
            </div>
          </div>
          
          <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
            <div style="background: #0A84FF; width: 6px; height: 6px; border-radius: 50%; margin: 8px 15px 0 0; flex-shrink: 0;"></div>
            <div>
              <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">Early access to playbooks</h3>
              <p style="margin: 0; color: #6b7280; line-height: 1.5;">Get new automation kits, frameworks, and templates before they're publicly available.</p>
            </div>
          </div>
          
          <div style="display: flex; align-items: flex-start;">
            <div style="background: #0A84FF; width: 6px; height: 6px; border-radius: 50%; margin: 8px 15px 0 0; flex-shrink: 0;"></div>
            <div>
              <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">Behind-the-scenes thinking</h3>
              <p style="margin: 0; color: #6b7280; line-height: 1.5;">The reasoning behind decisions, failed experiments, and lessons from the trenches.</p>
            </div>
          </div>
        </div>
        
        <div style="background: white; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Your first insight</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; border-left: 4px solid #0A84FF;">
            <p style="color: #374151; line-height: 1.6; margin: 0; font-weight: 500;">
              "Most founders overthink architecture and under-think operations. The system that ships beats the system that scales—every time."
            </p>
          </div>
          <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 14px;">
            This is the kind of compressed wisdom you'll get in every Build Notes issue.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://peycheff.com/products" 
             style="background: #0A84FF; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Explore All Products
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p style="margin: 0 0 10px 0;">Questions? Just reply to this email.</p>
          <p style="margin: 0;">
            Ivan Peycheff • <a href="https://peycheff.com" style="color: #0A84FF; text-decoration: none;">peycheff.com</a>
          </p>
          <p style="margin: 15px 0 0 0; font-size: 12px;">
            <a href="{unsubscribe_url}" style="color: #9ca3af; text-decoration: none;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `
  },

  PURCHASE_CONFIRMATION: {
    subject: (product) => `Your ${product.name} is ready - Here's what's next`,
    html: (purchase) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
          <div style="background: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
            <div style="background: white; width: 24px; height: 24px; border-radius: 50%;"></div>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Purchase Confirmed!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px;">Thank you for your purchase.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Order Details</h2>
          <div style="background: white; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <span style="color: #1a1a1a; font-weight: 600; font-size: 18px;">${purchase.product_name}</span>
              <span style="color: #10b981; font-weight: 700; font-size: 18px;">$${(purchase.amount / 100).toFixed(2)}</span>
            </div>
            <p style="color: #6b7280; margin: 0; line-height: 1.5;">${purchase.product_description}</p>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f3f4f6; font-size: 14px; color: #6b7280;">
              <strong>Order ID:</strong> ${purchase.session_id}<br>
              <strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
        
        <div style="background: white; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">What happens next?</h2>
          ${purchase.product_type === 'digital' ? `
            <div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
              <p style="margin: 0; color: #1e40af; font-weight: 600;">📁 Digital Download Ready</p>
            </div>
            <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Your download links are attached to this email</li>
              <li style="margin-bottom: 8px;">Files are available for immediate download</li>
              <li style="margin-bottom: 8px;">Keep this email for future access to your purchase</li>
              <li>Questions? Just reply to this email</li>
            </ul>
          ` : `
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
              <p style="margin: 0; color: #92400e; font-weight: 600;">📅 Service Booking</p>
            </div>
            <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">I'll reach out within 24 hours to schedule our session</li>
              <li style="margin-bottom: 8px;">We'll find a time that works for both our schedules</li>
              <li style="margin-bottom: 8px;">All sessions are recorded for your reference</li>
              <li>You'll receive a calendar invite with meeting details</li>
            </ul>
          `}
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://peycheff.com/contact" 
             style="background: #0A84FF; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Questions? Get in Touch
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p style="margin: 0 0 10px 0;">Thank you for supporting my work!</p>
          <p style="margin: 0;">
            Ivan Peycheff • <a href="mailto:ivan@peycheff.com" style="color: #0A84FF; text-decoration: none;">ivan@peycheff.com</a>
          </p>
        </div>
      </div>
    `
  }
};

// Email sending utility
export const sendEmail = async (emailData) => {
  try {
    const data = await resend.emails.send({
      from: 'Ivan Peycheff <ivan@peycheff.com>',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      replyTo: emailData.replyTo || 'ivan@peycheff.com'
    });
    
    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Helper to validate email configuration
export const validateEmailConfig = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is required');
  }
  
  if (!process.env.RESEND_API_KEY.startsWith('re_')) {
    throw new Error('Invalid RESEND_API_KEY format (should start with re_)');
  }
  
  return true;
};
