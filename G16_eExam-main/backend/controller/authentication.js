import User from '../models/user.js'
import Student from '../models/student.js'
import Examiner from '../models/examiner.js'
import Otp from '../models/otp.js'
import { send_otp, generate_password, generate_student_id, generate_otp, send_mail } from "../utils/authentication.js"
import { generateToken } from '../config/jwtUtils.js'
import bcrypt from "bcrypt"
import { create_student_templet, create_examiner_templet } from '../utils/mailTemplets.js'


export const create_session = async (req, res) => {
    try {
        const { emailUsername, password } = req.body;

        // Find user by email OR username OR mobile number
        const user = await User.findOne({
            $or: [
                { email: emailUsername },
                { username: emailUsername },
                { mobileno: emailUsername }
            ]
        });

        // If user not found
        if (!user) {
            return res.status(401).json({ message: "Invalid Email/Username/Mobile!" });
        }

        // Check password
        const pass_match = await bcrypt.compare(password, user.password);
        if (!pass_match) {
            return res.status(401).json({ message: "Incorrect Password!" });
        }

        // Generate token
        const token = generateToken(user);

        return res.status(200).json({
            token: token,
            username: user.username,
            role: user.role,
            message: "Login Successful"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const admin_login = async (req, res) => {
    try{
        const { password } = req.body;

        const admin = await User.findOne({username: "admin"});

        if(!admin){
            return res.status(401).json({ message: "Admin not found"});
        }

        // const pass_match = await bcrypt.compare(password, admin.password);
        // if(!admin || !pass_match){
        //     return res.status(401).json({ message: 'Invalid Email/Username or Password!' });
        // }

        const token = generateToken(admin);
        return res.status(200).json({ token: token, username: admin.username, role: admin.role, message: "Logged in successfully" });

    } catch(error){
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

export const create_student = async (req, res) => {
    try {
        const { firstname, lastname, middlename, dob, mobileno, email, gender, batch, branch, graduation } = req.body;

        if(!firstname || !lastname || !dob || !mobileno || !email || !gender || !batch || !branch || !graduation){
            return res.status(400).json({ message: 'All fields are required!' });
        }

        // Email validation (basic regex pattern for email format)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        // Check mobile number length (assuming mobile number should be exactly 10 digits)
        const mobilenoRegex = /^\d{10}$/;
        if (!mobilenoRegex.test(mobileno)) {
            return res.status(400).json({ message: 'Mobile number must be exactly 10 digits.' });
        }

        // DOB validation (expecting format 'YYYY-MM-DD')
        const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dobRegex.test(dob)) {
            return res.status(400).json({ message: 'Invalid date of birth format. Use YYYY-MM-DD.' });
        }

        const [year, month, day] = dob.split('-').map(Number);
        const date = new Date(year, month - 1, day); // Month is 0-indexed in JS Date

        // Check for valid day, month, and year in dob
        if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
            return res.status(400).json({ message: 'Invalid date of birth values.' });
        }

        const role = "Student";
        const password = generate_password(8);

        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(batch, graduation);
        

        const maxStudentID = await Student.aggregate([
            {
                $match: {
                  batch: Number(batch),
                  graduation: graduation
                }
              },
            {
              $group: {
                _id: null, 
                maxStudentID: { $max: "$username" } 
              }
            }
        ]);
        
        // Extract the maximum student ID or handle case where no documents are found
        const maximumStudentID = maxStudentID.length > 0 ? maxStudentID[0].maxStudentID : null;

        console.log(maxStudentID);
        
        
        let studentId = generate_student_id(batch, graduation, 1)
        if(maximumStudentID){
            studentId = Number(maximumStudentID) + 1;
        }
        

        const user = new User({
            username: studentId,
            firstname,
            lastname,
            middlename,
            dob:date,
            mobileno,
            email,
            gender,
            role,
            password: hashedPassword,
        });

        const savedUser = await user.save();

        const student = new Student({
            username: studentId,
            batch: batch,
            branch: branch,
            graduation: graduation,
            givenExams: []
        });

        await student.save();

        await send_mail(user.email, "Welcome to eExam", create_student_templet(`${user.firstname} ${user.lastname}`, user.username, password, process.env.FRONTEND_URL));

        return res.status(200).json({ message: "Student created successfully", user: savedUser });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

export const create_examiner = async (req, res) => {
    try {
        const { username, firstname, lastname, middlename, dob, mobileno, email, gender } = req.body;

        if(!username || !firstname || !lastname || !dob || !mobileno || !email || !gender){
            return res.status(400).json({ message: 'All fields are required!' });
        }

        // Email validation (basic regex pattern for email format)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        // Check mobile number length (assuming mobile number should be exactly 10 digits)
        const mobilenoRegex = /^\d{10}$/;
        if (!mobilenoRegex.test(mobileno)) {
            return res.status(400).json({ message: 'Mobile number must be exactly 10 digits.' });
        }

        // DOB validation (expecting format 'YYYY-MM-DD')
        const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dobRegex.test(dob)) {
            return res.status(400).json({ message: 'Invalid date of birth format. Use YYYY-MM-DD.' });
        }

        const [year, month, day] = dob.split('-').map(Number);
        const date = new Date(year, month - 1, day); // Month is 0-indexed in JS Date

        // Check for valid day, month, and year in dob
        if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
            return res.status(400).json({ message: 'Invalid date of birth values.' });
        }

        const role = "Examiner";
        const password = generate_password(8);

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            firstname,
            lastname,
            middlename,
            dob:date,
            mobileno,
            email,
            gender,
            role,
            password: hashedPassword,
        });

        const savedUser = await user.save();

        const examiner = new Examiner({
            username: username,
            prepaprepared_exams: [],
            prepared_questions: []
        });

        await examiner.save();

        await send_mail(user.email, "Welcome to eExam", create_examiner_templet(`${user.firstname} ${user.lastname}`, user.username, password, process.env.FRONTEND_URL));

        return res.status(200).json({ message: "Examiner created successfully", user: savedUser});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

export const create_admin = async (req, res) => {
    try {
        const { username, firstname, mobileno, email, password } = req.body;

        if(!username || !firstname || !mobileno || !email || !password){
            return res.status(400).json({ message: 'All fields are required!' });
        }

        // Email validation (basic regex pattern for email format)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        // Check mobile number length (assuming mobile number should be exactly 10 digits)
        const mobilenoRegex = /^\d{10}$/;
        if (!mobilenoRegex.test(mobileno)) {
            return res.status(400).json({ message: 'Mobile number must be exactly 10 digits.' });
        }

        const role = "Admin";
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            firstname,
            mobileno,
            email,
            role,
            password: hashedPassword,
        });

        await user.save();

        return res.status(200).json({ message: "Admin created successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

export const forgot_password = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({message : "An email is required." } );

        // Email validation (basic regex pattern for email format)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        // Check if user exists
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).json({message: "No account found with the provided email."});
        }

        const existing_otp = await Otp.findOne({email : email});
        if(existing_otp){
            return res.status(200).json({message : "Otp already sent"});
        }

        const otp = generate_otp();

        // Save OTP to database
        const otpRecord = new Otp({
            email: email,
            otp: otp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 600000  // 10 minutes
        });

        await otpRecord.save();
        
        // Send OTP email for password reset
        await send_otp(user.email, otp);
        
        return res.status(200).json({
            message: "Password reset OTP email sent",
            data: {
                email: user.email,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

export const resend_otp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({message : "An email is required." });

        // Email validation (basic regex pattern for email format)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        // Check if user exists
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({message: "No account found with the provided email."});
        }

        const existing_otp = await Otp.findOne({email : email});
        if(existing_otp){
            // Send OTP email for password reset
            await send_otp(user.email, existing_otp.otp);

            return res.status(200).json({message : "Otp resent successfully"});
        }

        const otp = generate_otp();

        // Save OTP to database
        const otpRecord = new Otp({
            email: email,
            otp: otp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 600000  // 10 minutes
        });

        await otpRecord.save();
        
        await send_otp(user.email, otp);
        
        return res.status(200).json({
            message: "Password reset OTP email sent",
            data: {
                email: user.email,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

export const verify_otp = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({message: "Email and OTP are required" });
        }

        // Check password length (e.g., minimum 8 characters)
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }

        // Find OTP records for the user by email
        const userOTPRecords = await Otp.findOne({ email : email });

        if (!userOTPRecords) {
            return res.status(400).json({ message: "Account record doesn't exist" });
        }

        // OTP record exists
        const expiresAt = userOTPRecords.expiresAt;
        const existing_otp = userOTPRecords.otp;

        if (expiresAt < Date.now()) {
            // OTP has expired
            await Otp.deleteMany({ email });
            return res.status(409).json({ message: "Code has expired. Please request again" });
        }

        if (otp !== existing_otp) {
            return res.status(401).json({ message: "Invalid OTP. Please try again." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findOneAndUpdate({ email: email }, {password: hashedPassword});

        await Otp.deleteMany({ email });

        return res.status(200).json({
            message: "Password changed successfully."
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

export const reset_password = async (req,res) => {
    try {
        const { old_password, new_password } = req.body;

        if (!old_password || !new_password) {
            return res.status(400).json({message: "All fields are required" });
        }

        const user = await User.findOne({username : req.user.username});

        if (!user) {
            return res.status(409).json({ message: 'User does not exists!'});
        }

        // Check password length (e.g., minimum 8 characters)
        if (new_password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }
        
        const pass_hash = await bcrypt.compare(old_password, user.password);
        if(!pass_hash){
            return res.status(400).json({ message: 'Incorrect Password' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({
            message: "Password has been changed"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}


