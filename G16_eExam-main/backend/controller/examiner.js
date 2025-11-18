import User from "../models/user.js";
import Examiner from '../models/examiner.js'

export const all_examiners = async (req, res) => {
    try{
        const examiners = await User.find({role: "Examiner"}).select("-password");

        if(!examiners){
            return res.status(404).json({message: "No Examiners Found"});
        }

        return res.status(200).json({ examiners: examiners, message: "Examiners fetched successfully"});
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

export const delete_examiner = async (req, res) => {
    try {
        const { username } = req.params; 

        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const examiner = await Examiner.findOne({ username });

        if (!examiner) {
            return res.status(404).json({ message: "Examiner not found." });
        }

        await Examiner.deleteOne({ _id: examiner._id });

        await User.deleteOne({ username: username });

        return res.status(200).json({ message: "Examiner and associated User deleted successfully." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

export const get_examiner = async (req, res) => {
    try{
        const { username } = req.params;

        if((req.user.role !== "Admin" && username !== req.user.username) || req.user.role === "Student"){
            return res.status(400).json({ message: 'Unathorized Access' });
        }

        const user = await User.findOne({ username }).select("-password");

        if(!user){
            return res.status(404).json({message: "Examiner not found"});
        }

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero
            const day = String(date.getDate()).padStart(2, '0');        // Add leading zero
          
            return `${year}-${month}-${day}`;
        };

        const response = {
            "firstname": user.firstname,
            "lastname": user.lastname,
            "middlename": user.middlename,
            "email": user.email,
            "mobileno": user.mobileno,
            "dob": formatDate(user.dob),
            "gender": user.gender,
        };
        

        return res.status(200).json({user: response, message: "Profile Fetched Successfully"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

export const update_profile = async (req, res) => {
    try {
        const { username } = req.params;  
        const { firstname, lastname, middlename, dob, mobileno, gender, email } = req.body;

        if(!username || !firstname || !lastname || !dob || !mobileno || !email || !gender){
            return res.status(400).json({ message: 'All fields are required!' });
        }

        const mobilenoRegex = /^\d{10}$/;
        if (!mobilenoRegex.test(mobileno)) {
            return res.status(400).json({ message: 'Mobile number must be exactly 10 digits.' });
        }

        const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dobRegex.test(dob)) {
            return res.status(400).json({ message: 'Invalid date of birth format. Use YYYY-MM-DD.' });
        }

        // Email validation (basic regex pattern for email format)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        const [year, month, day] = dob.split('-').map(Number);
        const date = new Date(year, month - 1, day); // Month is 0-indexed in JS Date

        // Check for valid day, month, and year in dob
        if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
            return res.status(400).json({ message: 'Invalid date of birth values.' });
        }

        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (firstname) user.firstname = firstname;
        if (lastname) user.lastname = lastname;
        if (middlename) user.middlename = middlename;
        if (dob) user.dob = date;
        if (mobileno) user.mobileno = mobileno;
        if (gender) user.gender = gender;
        if (email) user.email = email;

        await user.save();

        return res.status(200).json({ message: "Profile updated successfully.", user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};