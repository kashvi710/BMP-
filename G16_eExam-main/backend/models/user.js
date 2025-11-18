import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type : String,
        unique : true,
        required : true
    },

    firstname: {
        type : String,
        required: true
    },

    lastname: {
        type : String,
    },

    middlename: {
        type : String,
    },

    dob: {
        type : Date,
    },

    mobileno: {
        type : String,
        unique : true,
        required: true
    },

    email: {
        type : String,
        unique : true,
        required: true
    },

    gender: {
        type : String,
        enum : ['Male', 'Female', 'Other']
    },

    role: {
        type : String,
        enum : ['Student' , 'Admin', 'Examiner'],
        required: true
    },

    password: {
        type : String,
        required: true
    }
},{
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;