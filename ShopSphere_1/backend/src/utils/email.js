const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
};

const orderConfirmationEmail = (order) => `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; padding: 20px; }
  .container { max-width: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; padding: 30px; text-align: center; }
  .content { padding: 30px; }
  .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
  .total { font-size: 20px; font-weight: bold; color: #667eea; margin-top: 20px; }
  .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>🛒 ShopSphere</h1>
    <h2>Order Confirmed!</h2>
  </div>
  <div class="content">
    <p>Hi ${order.shippingAddress.fullName},</p>
    <p>Your order <strong>#${order.invoiceNumber}</strong> has been confirmed.</p>
    <h3>Order Summary</h3>
    ${order.orderItems.map((item) => `<div class="item"><span>${item.name} x${item.quantity}</span><span>₹${item.price * item.quantity}</span></div>`).join('')}
    <div class="total">Total: ₹${order.totalPrice}</div>
    <p style="margin-top:20px;">Estimated delivery: ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : '5-7 business days'}</p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} ShopSphere. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;

const resetPasswordEmail = (resetUrl) => `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; padding: 20px; }
  .container { max-width: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; padding: 30px; text-align: center; }
  .content { padding: 30px; text-align: center; }
  .btn { display: inline-block; background: #667eea; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
  .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
</style></head>
<body>
<div class="container">
  <div class="header"><h1>🛒 ShopSphere</h1><h2>Reset Your Password</h2></div>
  <div class="content">
    <p>You requested a password reset. Click the button below to set a new password.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p style="margin-top:20px;color:#888;">This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
  </div>
  <div class="footer"><p>© ${new Date().getFullYear()} ShopSphere. All rights reserved.</p></div>
</div>
</body>
</html>`;

module.exports = { sendEmail, orderConfirmationEmail, resetPasswordEmail };
