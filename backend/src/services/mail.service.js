import nodemailer from "nodemailer";
import { sendMail } from './mailer.js' // Assuming you have a separate file for sendMail

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendMail = async (to, subject, text, html) => {
    try {
        await transporter.sendMail({
            from: `"Shoe Store" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log(`📧 Email sent to ${to}`);
    } catch (error) {
        console.error("❌ Email send failed:", error.message);
    }
};

export const sendOrderEmail = async (email, order) => {
  const orderItemsHtml = order.items.map(item => `
    <div style="border-bottom: 1px solid #ccc; padding: 10px 0;">
      <h3 style="margin: 0;">${item.productId?.name}</h3>
      <p style="margin: 5px 0;">Brand: ${item.productId?.brand || 'N/A'}</p>
      <p style="margin: 5px 0;">Quantity: ${item.quantity}</p>
      <p style="margin: 5px 0;">Price: $${item.price.toFixed(2)}</p>
    </div>
  `).join('');

  const emailHtml = `
    <h1>Order Confirmation</h1>
    <p>Thank you for your order, your order ID is: ${order._id}</p>
    <h2>Order Summary</h2>
    ${orderItemsHtml}
    <div style="text-align: right; margin-top: 20px;">
      <strong>Total Amount: $${order.totalAmount.toFixed(2)}</strong>
    </div>
  `;

  await sendMail(email, `Order Confirmation #${order._id}`, 'Your order has been placed successfully.', emailHtml);
};