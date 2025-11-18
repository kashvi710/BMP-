import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import logo from "../assets/logo.png";
import user from "../assets/user.png";
import { useAuth } from "../../context/auth.jsx";
import { useNavigate } from "react-router-dom";
import config from "../../config.js";
import CreateExaminer from "./CreateExaminer.jsx";
import CreateStudent from "./CreateStudent.jsx";
import UpcomingexamAdmin from "../Exam/UpcomingexamAdmin.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";
import StudentProf from "../Profile/StudentProf.jsx";
import ExaminerProfile from "../Profile/ExaminerProfile.jsx";
import Loading from "../Loader/Loding.jsx"

function Admindashboard() {
    const [activeIndex, setActiveIndex] = useState(0);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 700);
    const [iscreateexamineropen, setiscreateexamineropen] = useState(false);
    const [iscreatestudentopen, setiscreatestudentopen] = useState(false);
    const [isupdatestudentopen, setisupdatestudentopen] = useState(false);
    const [isupdateexamineropen, setisupdateexamineropen] = useState(false);
    const [username, setUsername] = useState("");
    const { setIsLoggedIn, validateUser, isLoggedIn } = useAuth();
    const [isloaderon, setisloaderon] = useState(false);
    const [students, setStudents] = useState([]);
    const [examiners, setExaminers] = useState([]);

    const { LogOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (Cookies.get("token") === undefined) {
            navigate("/admin");
        }
    }, []);

    useEffect(() => {
        if (activeIndex === 3) {
            navigate("/reset-password");
        }
    }, [activeIndex]);

    const items = [
        { id: "student", label: "Student" },
        { id: "examiner", label: "Examiner" },
        { id: "exam", label: "Exam" },
        { id: "reser-password", label: "Reset Password" },
    ];

    //   const [examiners, setExaminers] = useState([
    //     { id: 1, name: "John Doe", email: "john.doe@example.com" },
    //     { id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
    //     { id: 3, name: "Robert Brown", email: "robert.brown@example.com" },
    //   ]);

    //   const [students, setstudents] = useState([
    //     { id: 1, name: "Nishank kansara", email: "202201111@example.com" },
    //     { id: 2, name: "Nishank kansara", email: "202201111@example.com" },
    //     { id: 3, name: "Nishank kansara", email: "202201111@example.com" },
    //   ]);

    const handleCreateExaminer = () => {
        setiscreateexamineropen(true);
    };

    const handleCreateStudent = () => {
        setiscreatestudentopen(true);
    };

    const handleCloseCreateExaminer = () => {
        setiscreateexamineropen(false);
    };
    const handleCloseCreateStudent = () => {
        setiscreatestudentopen(false);
    };

    const handleCloseUpdateStudent = () => {
        setisupdatestudentopen(false);
    };

    const handleCloseUpdateExaminer = () => {
        setisupdateexamineropen(false);
    };

    const fetchAllStudents = async () => {
        setisloaderon(true);
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.get(
                (config.BACKEND_API || "http://localhost:8000") +
                "/all-students",
                { headers }
            );

            if (result.status !== 200) {
                toast.error(result?.message || "Internal server error");
                setisloaderon(false);
                return;
            }
            setStudents(Object.values(result.data.students));
        } catch (e) {
            throw e;
        }
        setisloaderon(false);
    };

    const fetchAllExaminers = async () => {
        setisloaderon(true);
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.get(
                (config.BACKEND_API || "http://localhost:8000") +
                "/all-examiners",
                { headers }
            );

            // console.log(result);

            if (result.status !== 200) {
                toast.error(result?.message || "Internal server error");
                setisloaderon(false);
                return;
            }
            setExaminers(Object.values(result.data.examiners));
        } catch (e) {
            throw e;
        }
        setisloaderon(false);
    };

    useEffect(() => {
        if (activeIndex === 0) {
            // fetch all students

            try {
                fetchAllStudents();
            } catch (e) {
                toast.error(
                    e?.response?.data?.message || "Internal server error"
                );
            }
        } else if (activeIndex == 1) {
            try {
                fetchAllExaminers();
            } catch (e) {
                toast.error(
                    e?.response?.data?.message || "Internal server error"
                );
            }
        }
    }, [activeIndex]);

    const handleDeleteStudent = async (username) => {
        setisloaderon(true);
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.delete(
                (config.BACKEND_API || "http://localhost:8000") +
                `/delete-student/${username}`,
                { headers }
            );

            // console.log(result);

            if (result.status !== 200) {
                toast.error(result?.message || "Internal server error");
                setisloaderon(false);
                return;
            }

            setStudents((prev) =>
                prev.filter((item) => item.username !== username)
            );
            toast.success("Student Deleted Successfully");
        } catch (e) {
            console.log(e);

            toast.error(e?.response?.data?.message || "Internal server error");
        }
        setisloaderon(false);
    };

    const handleDeleteExaminer = async (username) => {
        setisloaderon(true);
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.delete(
                (config.BACKEND_API || "http://localhost:8000") +
                `/delete-examiner/${username}`,
                { headers }
            );

            // console.log(result);

            if (result.status !== 200) {
                toast.error(result?.message || "Internal server error");
                setisloaderon(false);
                return;
            }

            setExaminers((prev) =>
                prev.filter((item) => item.username !== username)
            );
            toast.success("Examiner Deleted Successfully");
        } catch (e) {
            console.log(e);

            toast.error(e?.response?.data?.message || "Internal server error");
        }
        setisloaderon(false);
    };

    const handleUpdateStudent = (username) => {
        setUsername(username);
        setisupdatestudentopen(true);
    };

    const handleUpdateExaminer = (username) => {
        setUsername(username);
        setisupdateexamineropen(true);
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 700);
            if (window.innerWidth >= 700) {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="dashboard">
            {isloaderon && <Loading />}
            {isMobileView && (
                <button
                    className="togglebtn"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    ☰
                </button>
            )}

            {/* Sidebar */}
            {isSidebarOpen && (
                <aside className="sidebar">
                    <div className="sidebar-menu">
                        <img src={logo} alt="Logo" id="logo" />
                        <ul className="menu">
                            {items.map((item, index) => (
                                <li key={item.id}>
                                    <a
                                        // href={`#${item.id}`}
                                        className={
                                            activeIndex === index
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() => setActiveIndex(index)}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <p className="logout" onClick={LogOut}>
                        Log out
                    </p>
                </aside>
            )}
            <div className="admin-dashboard-main-content">
                {/* Top Bar */}
                <header className="top-bar">
                    <span className="welcome-text">Welcome, Admin!</span>
                </header>

                {activeIndex == 1 && iscreateexamineropen && (
                    <div className="createExaminer-div">
                        <CreateExaminer
                            onClose={handleCloseCreateExaminer}
                            setExaminers={setExaminers}
                            toast={toast}
                        />
                    </div>
                )}
                {activeIndex == 1 && !iscreateexamineropen && (
                    <div>
                        <div className="examiner-list">
                            <div className="examiners-grid">
                                {examiners.length ? (
                                    examiners.map((examiner) => (
                                        <div
                                            key={examiner._id}
                                            className="examiner-card"
                                        >
                                            <h3>{examiner.username}</h3>
                                            <p>{examiner.email}</p>
                                            <div className="btn-del-upd">
                                                <button
                                                    onClick={() =>
                                                        handleDeleteExaminer(
                                                            examiner.username
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleUpdateExaminer(
                                                            examiner.username
                                                        )
                                                    }
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div>No Examiners Found</div>
                                )}
                            </div>
                        </div>
                        <button
                            className="create-examiner-button"
                            onClick={handleCreateExaminer}
                        >
                            + Create Examiner
                        </button>
                    </div>
                )}

                {activeIndex == 0 && iscreatestudentopen && (
                    <div className="createstudent-div">
                        <CreateStudent
                            onClose={handleCloseCreateStudent}
                            setStudents={setStudents}
                            toast={toast}
                        />
                    </div>
                )}
                {activeIndex == 0 && !iscreatestudentopen && (
                    <div>
                        <div className="examiner-list">
                            <div className="examiners-grid">
                                {students.length ? (
                                    students.map((student, index) => (
                                        <div
                                            key={student._id}
                                            className="examiner-card"
                                        >
                                            <h3>{index + 1}</h3>
                                            <p>{student.email}</p>
                                            <div className="btn-del-upd">
                                                <button
                                                    onClick={() =>
                                                        handleDeleteStudent(
                                                            student.username
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleUpdateStudent(
                                                            student.username
                                                        )
                                                    }
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div>No Students Found</div>
                                )}
                            </div>
                        </div>
                        <button
                            className="create-student-button"
                            onClick={handleCreateStudent}
                        >
                            + Create Student
                        </button>
                    </div>
                )}

                {activeIndex == 0 && isupdatestudentopen && (
                    <div className="createstudent-div">
                        <StudentProf
                            onClose={handleCloseUpdateStudent}
                            toast={toast}
                            username={username}
                            setStudents={setStudents}
                        />
                    </div>
                )}

                {activeIndex == 1 && isupdateexamineropen && (
                    <div className="createstudent-div">
                        <ExaminerProfile
                            onClose={handleCloseUpdateExaminer}
                            toast={toast}
                            username={username}
                            setExaminers={setExaminers}
                        />
                    </div>
                )}

                {activeIndex == 2 && (
                    <div className="upcomingexam">
                        <UpcomingexamAdmin />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Admindashboard;
