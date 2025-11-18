import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Homepage from "./Components/Homepage/Homepage";
import Dashboard from "./Components/Dashboard/Dashboard";

import Forgetpassword from "./Components/Login/forgetpassword";

import ResetPassword from "./Components/Profile/ResetPassword";
import Adminlogin from "./Components/Login/Adminlogin";

import StartExam from "./Components/Exam/Startexam"
import Examinterface from "./Components/Examinterface/Examinterface"

import Examinerdashboard from "./Components/Examinerdashboard/Examinerdashboard"


const App = () => {

    return (
        <>
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/dashboard" element={Cookies.get("role") === "Examiner" ? <Examinerdashboard />: <Dashboard />} />
                <Route path="/admin" element={<Adminlogin />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/forgot-password" element={<Forgetpassword />} />

                <Route path="/exams/:examId/start" element={<StartExam />} />
                <Route path="/exams/:examId" element={<Examinterface />} />
            </Routes>
        </>
    );
};

export default App;
