const resetCodeTemplate = ({ name, code }) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Password Reset Code</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f6f9; padding: 20px; }
        .container { background: #fff; max-width: 600px; margin: auto; padding: 30px; border-radius: 8px; }
        .code { font-size: 26px; font-weight: bold; color: #0056b3; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Hello ${name || "there"},</h2>
        <p>You recently requested to reset your password. Here is your verification code:</p>
        <div class="code">${code}</div>
        <p>This code is valid for 1 hour. If you didn’t request this, you can safely ignore this email.</p>
        <p>Thank you,<br/>The DPP Team</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} DPP Inc. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;
  };
  
  module.exports = resetCodeTemplate;
  