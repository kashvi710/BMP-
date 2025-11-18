import mongoose from "mongoose";
const Schema = mongoose.Schema;

const otpSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true 
    },
    otp: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    expiresAt: { 
        type: Date, 
        required: true,
        index: { expires: 0 } 
    },
});

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;