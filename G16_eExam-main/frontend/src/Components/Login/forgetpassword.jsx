import React, { useState, useEffect } from "react";
import "./forgetpassword.css";
import { useAuth } from "../../context/auth.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import config from "../../config.js";
import Loading from "../Loader/Loding.jsx"


const ForgetPassword = ({ onClose }) => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");
    const [resendTimer, setResendTimer] = useState(0); // Timer state
    const [isloaderon, setisloaderon] = useState(false);

    useEffect(() => {
        if (resendTimer > 0) {
            const timerId = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timerId);
        }
    }, [resendTimer]);

    const handleSubmit = async (e) => {
        setisloaderon(true);
        e.preventDefault();

        if (validateEmail(email)) {
            try {
                const results = await axios.post(
                    (config.BACKEND_API || "http://localhost:8000") +
                        "/forgot-password",
                    { email }
                );

                if (results.status === 200) {
                    toast.success(results.data.message);
                    setSubmitted(true);
                    setResendTimer(60); // Set timer to 60 seconds
                } else {
                    toast.error(results.data.message);
                }
            } catch (e) {
                toast.error(e?.response?.data?.message || "Internal server error");
            }
        } else {
            toast.error("Please enter a valid email address");
        }
        setisloaderon(false);
    };

    const handleSubmitOtp = async (e) => {
        e.preventDefault();
        setisloaderon(true);
    
        if (!otp || !newPassword || !confirmPassword) {
            toast.error("Fields should not be empty");
            setisloaderon(false);
            return;
        }
    
        
    
        // Password validation checks
        if (newPassword.length < 8 || newPassword.length > 30) {
            toast.error("Password must be between 8 and 30 characters long");
            setisloaderon(false);
            return;
        }
    
        if (!/[a-z]/.test(newPassword)) {
            toast.error("Password must contain at least one lowercase letter");
            setisloaderon(false);
            return;
        }
    
        if (!/[A-Z]/.test(newPassword)) {
            toast.error("Password must contain at least one uppercase letter");
            setisloaderon(false);
            return;
        }
    
        if (!/\d/.test(newPassword)) {
            toast.error("Password must contain at least one number");
            setisloaderon(false);
            return;
        }
    
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
            toast.error("Password must contain at least one special character");
            setisloaderon(false);
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            setisloaderon(false);
            return;
        }
    
        try {
            const results = await axios.post(
                (config.BACKEND_API || "http://localhost:8000") + "/verify-otp",
                { email, otp, password: newPassword }
            );
    
            if (results.status === 200) {
                toast.success(results.data.message);
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                toast.error(results.data.message);
            }
        } catch (e) {
            toast.error(e?.response?.data?.message || "Internal server error");
        }
        setisloaderon(false);
    };
    
    
    const handleResendOtp = async () => {
        setisloaderon(true);
        if (resendTimer > 0) return;
        try {
            const results = await axios.post(
                (config.BACKEND_API || "http://localhost:8000") + "/resend-otp",
                { email }
            );

            if (results.status === 200) {
                toast.success(results.data.message);
                setResendTimer(60); // Reset timer to 60 seconds
            } else {
                toast.error(results.data.message);
            }
        } catch (e) {
            toast.error(e?.response?.data?.message || "Internal server error");
        }
        setisloaderon(false);
    };

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    return (
        <div className="forget-password-wrapper">
        {isloaderon && <Loading/>}
            <div className="forget-password-container">
                <h2>Forgot Your Password?</h2>
                {submitted ? (
                    <p>OTP sent to your email</p>
                ) : (
                    <p>Enter your email address</p>
                )}

                {submitted ? (
                    <form onSubmit={handleSubmitOtp}>
                        <input
                            type="text"
                            placeholder="OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            id="fin"
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            id="fin"
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmNewPassword(e.target.value)
                            }
                            required
                            id="fin"
                        />
                        <p
                            type="button"
                            onClick={handleResendOtp}
                            className={`resend-otp ${
                                resendTimer > 0 ? "disabled" : ""
                            }`}
                            disabled={resendTimer > 0}
                        >
                            {resendTimer > 0
                                ? `Resend OTP in ${resendTimer}s`
                                : "Resend OTP"}
                        </p>
                        <button type="submit" className="resetlink-button">
                            Change Password
                        </button>
                        <button onClick={onClose} className="close-button">
                            Close
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            id="fin"
                        />
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="resetlink-button">
                            Send OTP
                        </button>
                        <button onClick={onClose} className="close-button">
                            Close
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgetPassword;
