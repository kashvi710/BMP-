export const password_reset_templet = (otp) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f3f3f3;
            margin: 0;
            padding: 0;
        }
        .email-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            color: #3F72AF;
            text-align: center;
            margin-bottom: 20px;
        }
        .footer {
            font-size: 12px;
            text-align: center;
            color: #999999;
        }
        .footer a {
            color: #3F72AF;
            text-decoration: none;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h2>Password Reset Request</h2>
        </div>
        <div class="otp">
            Your OTP: <strong>${otp}</strong>
        </div>
        <div class="footer">
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>For support, contact us at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a></p>
        </div>
    </div>
</body>
</html>`;
};

export const create_student_templet = (name, username, password, siteUrl) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Email</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f0f8ff; margin: 0; padding: 0;">

    <table align="center" width="600" style="border-collapse: collapse; background-color: #ffffff; margin: 20px auto; border: 1px solid #d9eaff; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
        <tr>
            <td style="background-color: #1e90ff; color: #ffffff; text-align: center; padding: 20px;">
                <h1 style="margin: 0; font-size: 24px;">Welcome to eExam</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px; color: #333;">
                <p style="font-size: 16px; line-height: 1.5;">Dear <strong>${name}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.5;">We are delighted to welcome you to <strong>eExam</strong>! Below are your credentials to access the Student Portal:</p>
                <p style="font-size: 16px; line-height: 1.5; background-color: #eaf4fe; padding: 10px; border-radius: 5px; border: 1px solid #d9eaff;">
                    <strong>Student ID:</strong> ${username}<br>
                    <strong>Password:</strong> ${password}
                </p>
                <p style="font-size: 16px; line-height: 1.5;">Please follow these steps to log in for the first time:</p>
                <ol style="font-size: 16px; line-height: 1.5; padding-left: 20px; color: #333;">
                    <li>Visit the Student Portal at <a href="${siteUrl}" style="color: #1e90ff; text-decoration: none;">Link</a>.</li>
                    <li>Enter your credentials above.</li>
                    <li>Change your password after logging in to ensure account security.</li>
                </ol>
                <p style="font-size: 16px; line-height: 1.5; color: #ff0000;"><strong>Note:</strong></p>
                <ul style="font-size: 16px; line-height: 1.5; padding-left: 20px; color: #333;">
                    <li>Keep your credentials confidential.</li>
                    <li>If you experience any issues, contact us at <a href="mailto:support@eexam.com" style="color: #1e90ff; text-decoration: none;">support@eexam.com</a>.</li>
                </ul>
                <p style="font-size: 16px; line-height: 1.5;">We wish you the best in your academic journey!</p>
                <p style="font-size: 16px; line-height: 1.5;">Best regards,<br><strong>eExam</strong></p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #eaf4fe; color: #333; text-align: center; padding: 10px; font-size: 14px;">
                <p style="margin: 0;">eExam | support@eexam.com</p>
            </td>
        </tr>
    </table>

</body>
</html>
`;
};

export const create_examiner_templet = (name, username, password, siteUrl) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Email</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f0f8ff; margin: 0; padding: 0;">

    <table align="center" width="600" style="border-collapse: collapse; background-color: #ffffff; margin: 20px auto; border: 1px solid #d9eaff; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
        <tr>
            <td style="background-color: #1e90ff; color: #ffffff; text-align: center; padding: 20px;">
                <h1 style="margin: 0; font-size: 24px;">Welcome to eExam</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px; color: #333;">
                <p style="font-size: 16px; line-height: 1.5;">Dear <strong>${name}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.5;">We are excited to have you as a part of the <strong>eExam</strong> team! Below are your credentials to access the Examiner Portal:</p>
                <p style="font-size: 16px; line-height: 1.5; background-color: #eaf4fe; padding: 10px; border-radius: 5px; border: 1px solid #d9eaff;">
                    <strong>Examiner ID:</strong> ${username}<br>
                    <strong>Password:</strong> ${password}
                </p>
                <p style="font-size: 16px; line-height: 1.5;">Please follow these steps to log in for the first time:</p>
                <ol style="font-size: 16px; line-height: 1.5; padding-left: 20px; color: #333;">
                    <li>Visit the Examiner Portal at <a href="${siteUrl}" style="color: #1e90ff; text-decoration: none;">Link</a>.</li>
                    <li>Enter your credentials above.</li>
                    <li>Change your password after logging in to ensure account security.</li>
                </ol>
                <p style="font-size: 16px; line-height: 1.5; color: #ff0000;"><strong>Note:</strong></p>
                <ul style="font-size: 16px; line-height: 1.5; padding-left: 20px; color: #333;">
                    <li>Keep your credentials confidential.</li>
                    <li>If you experience any issues, contact us at <a href="mailto:support@eexam.com" style="color: #1e90ff; text-decoration: none;">support@eexam.com</a>.</li>
                </ul>
                <p style="font-size: 16px; line-height: 1.5;">We are confident that your expertise will greatly contribute to the success of our platform.</p>
                <p style="font-size: 16px; line-height: 1.5;">Best regards,<br><strong>eExam</strong></p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #eaf4fe; color: #333; text-align: center; padding: 10px; font-size: 14px;">
                <p style="margin: 0;">eExam | support@eexam.com</p>
            </td>
        </tr>
    </table>

</body>
</html>
`;
};