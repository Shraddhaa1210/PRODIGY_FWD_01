const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, verificationToken) => {
  const verificationLink = `${process.env.BASE_URL || 'http://localhost:5000'}/api/verify-email/${verificationToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@auth-system.com',
    to: email,
    subject: 'Verify Your Email - Authentication System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Our Authentication System! 🎉</h1>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #007bff;">Email Verification Required</h2>
          <p>Thank you for registering! Please verify your email address to complete your account setup.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background: #007bff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              ✅ Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Or copy this link: <br>
            <code style="background: #eee; padding: 5px; border-radius: 3px;">
              ${verificationLink}
            </code>
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
          <p>If you didn't create this account, you can safely ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.BASE_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
      <p>This link expires in 1 hour.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };