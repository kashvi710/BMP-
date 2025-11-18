import {password_reset_templet} from "./mailTemplets.js"
import {transporter} from "../config/nodemailer.js"

export const generate_otp = () => {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;   

    return otp;
}

// Generate 8 length random password with at least one special character, one uppercase letter, one lowercase letter, and one digit
export const generate_password = () => {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
    const allChars = upperCase + lowerCase + digits + specialChars;

    let password = '';
    password += upperCase.charAt(Math.floor(Math.random() * upperCase.length));
    password += lowerCase.charAt(Math.floor(Math.random() * lowerCase.length));
    password += digits.charAt(Math.floor(Math.random() * digits.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

    for (let i = 4; i < 8; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    return password.split('').sort(() => 0.5 - Math.random()).join('');
}

export const generate_student_id = (batch, programType, studentNo) => {
    const typeCode = programType === 'UG' ? '0' : '1';
    const studentNumber = studentNo.toString().padStart(4, '0'); // Ensure it's 4 digits
    return `${batch}${typeCode}${studentNumber}`;
}

export const send_otp = async (email, otp) => {
    try{
        
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Password Reset OTP",
            html: password_reset_templet(otp)
        };

        await transporter.sendMail(mailOptions);
        
    }
    catch (error){
        console.log(error)
        throw error
    }
    
}

export const send_mail = async (email, subject, html) => {
    try{
        
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: subject,
            html: html
        };

        await transporter.sendMail(mailOptions);
        
    }
    catch (error){
        console.log(error)
        throw error
    }
    
}
