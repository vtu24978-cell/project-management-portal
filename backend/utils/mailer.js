const nodemailer = require('nodemailer');

const sendTaskNotification = async (recipientEmail, recipientName, taskTitle, taskDescription) => {
  const useRealSMTP = process.env.SMTP_HOST && process.env.SMTP_USER;
  
  let transporter;
  if (useRealSMTP) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    console.log(`[MOCK EMAIL] Sending email notification to: ${recipientName} <${recipientEmail}>`);
    console.log(`Subject: New Task Assigned: ${taskTitle}`);
    console.log(`Body: Hello ${recipientName},\n\nA new task has been assigned to you:\n\nTitle: ${taskTitle}\nDescription: ${taskDescription}\n\nRegards,\nTaskFlow Team`);
    return { mock: true, messageId: 'mock-id' };
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || '"TaskFlow System" <noreply@taskflow.com>',
    to: `"${recipientName || 'Assignee'}" <${recipientEmail}>`,
    subject: `New Task Assigned: ${taskTitle}`,
    text: `Hello ${recipientName || 'Assignee'},\n\nA new task has been assigned to you:\n\nTitle: ${taskTitle}\nDescription: ${taskDescription}\n\nRegards,\nTaskFlow Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #6366f1; margin-top: 0;">New Task Assigned 🚀</h2>
        <p>Hello <strong>${recipientName || 'Assignee'}</strong>,</p>
        <p>A new task has been created and assigned to you on TaskFlow:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #6366f1; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a;">${taskTitle}</h3>
          <p style="color: #475569; white-space: pre-wrap;">${taskDescription}</p>
        </div>
        <p>You can view and update the status of this task by logging into your TaskFlow dashboard.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 0.8rem; color: #94a3b8;">This is an automated notification. Please do not reply directly to this email.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    throw error;
  }
};

module.exports = { sendTaskNotification };
