// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendOrderEmail = async (userEmail, orderData) => {
//     try {
//         const { _id, items, totalAmount } = orderData;

//         const itemList = items
//             .map(
//                 (item) =>
//                     `<li>${item.product.name} (x${item.quantity}) - ₹${item.price}</li>`
//             )
//             .join("");

//         const htmlContent = `
//             <h2>Thank you for your order!</h2>
//             <p>Your order <strong>#${_id}</strong> has been placed successfully.</p>
//             <p><strong>Order Summary:</strong></p>
//             <ul>${itemList}</ul>
//             <p><strong>Total: ₹${totalAmount}</strong></p>
//             <p>We will notify you once your order is shipped 🚚</p>
//         `;

//         await resend.emails.send({
//             from: "onboarding@resend.dev", 
//             to: userEmail,
//             subject: `Order Confirmation #${_id}`,
//             html: htmlContent,
//         });

//         console.log("Order email sent to", userEmail);
//     } catch (error) {
//         console.error("Error sending order email:", error);
//     }
// };
