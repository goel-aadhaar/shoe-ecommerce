import nodemailer from "nodemailer";

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
