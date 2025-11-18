import React, { useEffect, useState } from "react";
import "./CreateStudent.css";
import axios from "axios";
import Cookies from "js-cookie";
import config from "../../config.js";
import Loading from "../Loader/Loding.jsx"


const CreateStudent = ({ onClose, setStudents, toast }) => {
    const currentYear = new Date().getFullYear();
    const [isloaderon, setisloaderon] = useState(false);

    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        middlename: "",
        dob: "",
        email: "",
        contact: "",
        admissionYear: currentYear,
        studentType: "", // UG or PG
        gender: "", // Male or Female
        branch: "", // ICT, CS, MNC
    });

    // Update form data on input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const contactRegex = /^\d{10}$/; // Must be 10 digits
        const nameRegex = /^[A-Za-z]{1,30}$/; // Only letters, 1-30 characters, no spaces
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
    
        // Validate firstname
        if (!nameRegex.test(formData.firstname.trim())) {
            toast.error("First Name must only contain letters and be between 1 and 30 characters.");
            return;
        }
    
        // Validate middlename (if provided)
        if (formData.middlename.trim() && !nameRegex.test(formData.middlename.trim())) {
            toast.error("Middle Name must only contain letters and be between 1 and 30 characters.");
            return;
        }
    
        // Validate lastname
        if (!nameRegex.test(formData.lastname.trim())) {
            toast.error("Last Name must only contain letters and be between 1 and 30 characters.");
            return;
        }
    
        // Validate contact number
        if (!contactRegex.test(formData.contact.trim())) {
            toast.error("Contact number must be 10 digits.");
            return;
        }
    
        // Validate student type
        if (!formData.studentType) {
            toast.error("Please select your graduation type (UG or PG).");
            return;
        }
    
        // Validate admission year
        if (formData.admissionYear < currentYear) {
            toast.error("Admission year cannot be in the past.");
            return;
        }
    
        // Validate date of birth
        const dob = new Date(formData.dob);
        if (dob >= currentDate) {
            toast.error("Date of birth must be in the past.");
            return;
        }
    
        // All validations passed, proceed with the submission
        setisloaderon(true);
    
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };
    
            const result = await axios.post(
                (config.BACKEND_API || "http://localhost:8000") + "/create-student",
                {
                    firstname: formData.firstname.trim(),
                    lastname: formData.lastname.trim(),
                    middlename: formData.middlename.trim(),
                    dob: formData.dob,
                    mobileno: formData.contact.trim(),
                    email: formData.email.trim(),
                    gender: formData.gender,
                    batch: formData.admissionYear,
                    branch: formData.branch,
                    graduation: formData.studentType,
                },
                { headers }
            );
    
            if (result.status !== 200) {
                toast.error(result?.data?.message || "Internal server error");
                setisloaderon(false);
                return;
            }
    
            toast.success(result.data.message);
            onClose();
            setStudents((prev) => [...prev, result.data.user]);
        } catch (e) {
            console.log(e);
            toast.error(e?.response?.data?.message || "Internal server error");
        }
        setisloaderon(false);
    };
    
    // Reset form data
    const handleClose = () => {
        setFormData({
            firstname: "",
            lastname: "",
            middlename: "",
            dob: "",
            email: "",
            contact: "",
            admissionYear: "",
            studentType: "",
            gender: "",
            branch: "",
        });
        // console.log('Form closed or reset');
    };

    return (
        <div className="create-student-container">
            {isloaderon && <Loading />}
            <h2 className="createstudentheader">Create Student</h2>
            <form onSubmit={handleSubmit} className="student-form">
                <div className="form-group">
                    <div className="half-width">
                        <label htmlFor="firstname">First Name:</label>
                        <input
                            type="text"
                            id="firstname"
                            name="firstname"
                            value={formData.firstname}
                            onChange={handleChange}
                            placeholder="Enter first name"
                            required
                        />
                    </div>
                    <div className="half-width">
                        <label htmlFor="lastname">Last Name:</label>
                        <input
                            type="text"
                            id="lastname"
                            name="lastname"
                            value={formData.lastname}
                            onChange={handleChange}
                            placeholder="Enter lastname"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="half-width">
                        <label htmlFor="middlename">Middle Name:</label>
                        <input
                            type="text"
                            id="middlename"
                            name="middlename"
                            value={formData.middlename}
                            onChange={handleChange}
                            placeholder="Enter father's name"
                        />
                    </div>
                    <div className="half-width">
                        <label htmlFor="dob">Date of Birth:</label>
                        <input
                            type="date"
                            id="dob"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="half-width">
                        <label htmlFor="email">Email Address:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            required
                        />
                    </div>
                    <div className="half-width">
                        <label htmlFor="contact">Contact Number:</label>
                        <input
                            type="tel"
                            id="contact"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            placeholder="Enter contact number"
                            required
                            pattern="\d{10}"
                            title="Contact number must be 10 digits"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="half-width">
                        <label htmlFor="admissionYear">Admission Year:</label>
                        <input
                            type="number"
                            id="admissionYear"
                            name="admissionYear"
                            value={formData.admissionYear}
                            onChange={handleChange}
                            placeholder="Enter admission year"
                            required
                        />
                    </div>
                    <div className="select-branch">
                        <label htmlFor="branch">Branch:</label>
                        <select
                            id="branch"
                            name="branch"
                            value={formData.branch}
                            onChange={handleChange}
                            required
                            aria-label="Select branch"
                        >
                            <option value="">
                                Select branch
                            </option>
                            <option value="ICT">
                                Information and Communication Technology
                            </option>
                            <option value="CS">Computer Science</option>
                            <option value="MnC">
                                Mathematics and Computation
                            </option>
                            <option value="EVD">
                                Electronics and VLSI Design
                            </option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <div className="radio-group">
                        <label>Gender:</label>
                        <div className="radio-group-div">
                            <input
                                type="radio"
                                name="gender"
                                value="Male"
                                checked={formData.gender === "Male"}
                                onChange={handleChange}
                                required
                            />
                            Male
                            <input
                                type="radio"
                                name="gender"
                                value="Female"
                                checked={formData.gender === "Female"}
                                onChange={handleChange}
                                required
                            />
                            Female
                        </div>
                    </div>
                    <div className="radio-group">
                        <label>Graduation:</label>
                        <div className="radio-group-div">
                            <input
                                type="radio"
                                name="studentType"
                                value="UG"
                                checked={formData.studentType === "UG"}
                                onChange={handleChange}
                                required
                            />
                            UG
                            <input
                                type="radio"
                                name="studentType"
                                value="PG"
                                checked={formData.studentType === "PG"}
                                onChange={handleChange}
                                required
                            />
                            PG
                        </div>
                    </div>
                </div>

                <button type="submit" className="submit-btn">
                    Create Student
                </button>
                <button type="button" onClick={onClose} className="close-btn">
                    Close
                </button>
            </form>
        </div>
    );
};

export default CreateStudent;
