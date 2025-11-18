import React, { useState, useEffect } from "react";
import "./ExaminerProfile.css";
import user from "../assets/user.png";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import config from "../../config.js";
import { useAuth } from "../../context/auth.jsx";
import axios from "axios";
import Loading from "../Loader/Loding.jsx"


function ExaminerProfile({ onClose, toast, username, setExaminers }) {
    const [userData, setUserData] = useState({
        firstname: "",
        lastname: "",
        middlename: "",
        email: "",
        mobileno: "",
        dob: "",
        gender: "",
    });
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // New state to check if user is an admin
    const { setIsLoggedIn, validateUser, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [isloaderon, setisloaderon] = useState(false);


    useEffect(() => {
        if (!Cookies.get("role")) {
            navigate("/");
        }

        if (Cookies.get("role") === "Admin") {
            setIsAdmin(true);
        }

        fetch_data();
    }, []);

    const fetch_data = async () => {

        setisloaderon(true);
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.get(
                (config.BACKEND_API || "http://localhost:8000") +
                    `/get-examiner/${username}`,
                { headers }
            );

            // console.log(result);

            setUserData(result.data.user);
        } catch (e) {
            console.log(e);

            toast.error(e?.response?.data?.message || "Internal server error");
        }
        setisloaderon(false);
    };

    const handleresetpass = () => {
        navigate("/reset-password");
    };

    // Update form data on input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value,
        });
        // console.log(userData);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        
        const today = new Date();
        const dob = new Date(userData.dob);
        // Check first name, middle name, and last name length
        if (
            userData.firstname.length < 1 ||
            userData.firstname.length > 30 ||
            userData.middlename.length < 1 ||
            userData.middlename.length > 30 ||
            userData.lastname.length < 1 ||
            userData.lastname.length > 30
        ) {
            toast.error("First name, middle name, and last name must be between 1 and 30 characters");
            return;
        }
        // Check date of birth
        if (dob >= today) {
            toast.error("Date of birth must be before the current date");
            return;
        }
        const contactRegex = /^\d{10}$/;
        setisloaderon(true);
        if (!contactRegex.test(userData.mobileno)) {
            toast.error("Contact number must be 10 digits");
            setisloaderon(false);
            return;
        }
        
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.put(
                (config.BACKEND_API || "http://localhost:8000") +
                    `/update-examiner/${username}`,
                userData,
                { headers }
            );

            // console.log(result);

            if (result.status !== 200) {
                toast.error(result?.data?.message || "Internal server error");
                setisloaderon(false);
                return;
            }

            toast.success(result.data.message);
            onClose();

            if (setExaminers) {
                setExaminers((prevItems) => {
                    const index = prevItems.findIndex(
                        (item) => item.username === username
                    );
                    if (index !== -1) {
                        const updatedItems = [...prevItems];
                        updatedItems[index] = {
                            ...updatedItems[index],
                            ...userData,
                        }; // Update element
                        setisloaderon(false);
                        return updatedItems;
                    }
                    setisloaderon(false);
                    return prevItems;
                });
            }
        } catch (e) {
            console.log(e);

            toast.error(e?.response?.data?.message || "Internal server error");
        }
        setisloaderon(false);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="studentpdiv">
        {isloaderon && <Loading/>}
            <div id="profilecontainer">
                <div id="profile-card">
                    <div id="content">
                        <h2>Profile Settings</h2>
                        <form id="profile-form">
                            <div id="form-group">
                                <label>Examiner Username</label>
                                <input type="text" value={username} readOnly />
                            </div>
                            <div id="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="firstname"
                                    placeholder="Enter first number"
                                    value={userData.firstname}
                                    onChange={handleChange}
                                    readOnly={!isAdmin}
                                />
                            </div>
                            <div id="form-group">
                                <label>Middle Name</label>
                                <input
                                    type="text"
                                    name="middlename"
                                    placeholder="Enter Middle Name"
                                    value={userData.middlename}
                                    onChange={handleChange}
                                    readOnly={!isAdmin}
                                />
                            </div>
                            <div id="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="lastname"
                                    placeholder="Enter Last Name"
                                    value={userData.lastname}
                                    onChange={handleChange}
                                    readOnly={!isAdmin}
                                />
                            </div>
                            <div id="form-group">
                                <label>Email</label>
                                <input
                                    type="text"
                                    name="email"
                                    placeholder="Enter email"
                                    value={userData.email}
                                    onChange={handleChange}
                                    readOnly={!isAdmin}
                                />
                            </div>
                            <div id="form-group">
                                <label>Mobile No</label>
                                <input
                                    type="Number"
                                    name="mobileno"
                                    placeholder="Enter Mobile no"
                                    value={userData.mobileno}
                                    onChange={handleChange}
                                    readOnly={!isAdmin}
                                />
                            </div>
                            <div id="form-group">
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    placeholder="Date of Birth"
                                    value={userData.dob}
                                    onChange={(e) =>
                                        setUserData({
                                            ...userData,
                                            dob: e.target.value,
                                        })
                                    }
                                    readOnly={!isAdmin}
                                />
                            </div>
                            <div className="select-branch">
                                <label htmlFor="gender">Gender</label>
                                <select
                                    className="select-branch-select"
                                    name="gender"
                                    value={userData.gender}
                                    onChange={handleChange}
                                    required
                                    aria-label="Select gender"
                                    disabled={!isAdmin}
                                >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female" selected>
                                        Female
                                    </option>
                                </select>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar with Profile Image, Info, Reset Password Button, and Edit Profile (only for Admins) */}
                    <div id="sbar">
                        <div>
                            <img src={user} alt="Profile" id="profile-pic" />
                            <h3 id="profile-name">
                                {`${userData.firstname} ${userData.lastname}`}
                            </h3>
                            <p id="profile-email">{userData.email}</p>
                        </div>
                        <div className="profilebtns">
                        {!isAdmin &&
                            <button
                                type="button"
                                id="reset-button"
                                onClick={handleresetpass}
                            >
                                Reset Password
                            </button>
                        }
                            {isAdmin && ( // Only render the "Edit Profile" button if the user is an admin
                                <button
                                    type="button"
                                    id="save-button"
                                    onClick={handleSaveProfile}
                                >
                                    Save Changes
                                </button>
                            )}
                            <button
                                type="button"
                                id="reset-button"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExaminerProfile;
