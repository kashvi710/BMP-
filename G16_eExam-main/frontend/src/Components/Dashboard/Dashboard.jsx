import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import logo from "../assets/logo.png";
import user from "../assets/user.png";
import { useAuth } from "../../context/auth.jsx";
import { useNavigate } from "react-router-dom";
import StudentProfile from "../Profile/StudentProf.jsx";
import QuestionBank from "../Questions/QuestionBank.jsx";
import Upcomingexam from "../Exam/Upcomingexam.jsx";
import PerformanceResultPage from "../PerformanceResultPage/PerformanceResultPage.jsx";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axios from "axios";
import config from "../../config.js";
import Loading from "../Loader/Loding.jsx"
import Examinerdashboard from "../Examinerdashboard/Examinerdashboard.jsx";


const Calendar = ({ exams, changeMonth, events, setEvents, set_events }) => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);
    // const [events, setEvents] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [eventText, setEventText] = useState("");

    useEffect(() => {
        changeMonth(currentDate.getMonth(), currentDate.getFullYear());
    }, [currentDate]);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const startDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    ).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        );
    };

    const handleNextMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
        );
    };

    const formatDate = (day) => {

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0"); 
        const dayy = String(day).padStart(2, "0");
        
        return `${year}-${month}-${dayy}`;
    };

    const handleDateClick = (day) => {
        setSelectedDate(day);
        const eventKey = formatDate(day);
        
        setEventText(events[eventKey] || "");
    };

    const handleEventChange = (e) => {
        setEventText(e.target.value);
    };

    const saveEvent = () => {
        const eventKey = formatDate(selectedDate);
        setEvents((prevEvents) => ({ ...prevEvents, [eventKey]: eventText }));
        setSelectedDate(null);
    };

    const removeEvent = () => {
        const eventKey = formatDate(selectedDate);
        setEvents((prevEvents) => {
            const updatedEvents = { ...prevEvents };
            delete updatedEvents[eventKey];
            return updatedEvents;
        });
        setEventText("");
        setSelectedDate(null);
    };

    const renderDays = () => {
        const totalDays = daysInMonth(
            currentDate.getFullYear(),
            currentDate.getMonth()
        );
        const daysArray = Array.from(
            { length: startDayOfMonth },
            () => null
        ).concat(Array.from({ length: totalDays }, (_, i) => i + 1));

        return daysArray.map((day, index) => {
            if (!day) return <div key={index} className="calendar-day empty" />;
            const eventKey = formatDate(day);
            return (
                <div
                    key={index}
                    className={`calendar-day ${day ? "active" : ""}`}
                    onClick={() => handleDateClick(day)}
                >
                    {day}
                    {events[eventKey] && <div className="event" />}
                </div>
            );
        });
    };

    return (
        <div className="calendar">
            <div className="calendar-header">
                <button onClick={handlePrevMonth}>&lt;</button>
                <h2>
                    {currentDate.toLocaleString("default", { month: "long" })}{" "}
                    {currentDate.getFullYear()}
                </h2>
                <button onClick={handleNextMonth}>&gt;</button>
            </div>
            <div className="calendar-grid-day">
                <div className="calendar-day-name">Sun</div>
                <div className="calendar-day-name">Mon</div>
                <div className="calendar-day-name">Tue</div>
                <div className="calendar-day-name">Wed</div>
                <div className="calendar-day-name">Thu</div>
                <div className="calendar-day-name">Fri</div>
                <div className="calendar-day-name">Sat</div>
            </div>
            <div className="calendar-grid">{renderDays()}</div>

            {selectedDate && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>
                            Exams for {selectedDate}{" "}
                            {currentDate.toLocaleString("default", {
                                month: "long",
                            })}
                        </h3>
                        <textarea
                            value={eventText}
                            onChange={handleEventChange}
                            placeholder="No Exams"
                            readOnly
                        />
                        {/* <button onClick={saveEvent}>Save Event</button>
                        <button onClick={removeEvent}>Remove Event</button> */}
                        <button
                            className="event-close"
                            onClick={() => setSelectedDate(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

function Dashboard() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 700);
    const { setIsLoggedIn, validateUser, LogOut, isLoggedIn } = useAuth();
    
    const [opneStudentProfile, setOpneStudentProfile] = useState(false);
    const [username, setUsername] = useState(null);
    
    const [upcomingexams5, setUpcomingexams5] = useState([]);
    const [pastexams5, setPastexams5] = useState([]);
    const [upcomingexams, setUpcomingexams] = useState([]);
    const [upcomingexamscurmonth, setUpcomingexamscurmonth] = useState([]);
    const [events, setEvents] = useState([]);
    const [performance, setPerformance] = useState(0);
    const [isloaderon, setisloaderon] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!Cookies.get("token") || !Cookies.get("role") || Cookies.get("role") === "Admin") {
            navigate("/");
        }
        else{
            setUsername(Cookies.get("username"));
            fetch_upcoming_exams();
            fetch_upcoming_exams_5();
            fetch_past_exams_5();
            fetch_student_performance();
        }
    }, []);

    const formatDateYY = (date) => {
        date = new Date(date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero
        const day = String(date.getDate()).padStart(2, "0"); // Add leading zero

        return `${year}-${month}-${day}`;
    };

    const set_events = () => {
        setEvents({});
        upcomingexams.forEach((exam) => {
            const formattedDate = formatDateYY(exam.startTime);

            setEvents((prev) => ({
                ...prev,
                [formattedDate]: prev[formattedDate]
                    ? `${prev[formattedDate]}, ${exam.title}`
                    : exam.title,
            }));
        });

        const curDate = new Date();
        change_upcoming_exams_for_month(curDate.getMonth(), curDate.getFullYear());
    };

    useEffect(() => {
        set_events();
    }, [upcomingexams]);

    const fetch_upcoming_exams_5 = async () => {
        setisloaderon(true);

        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.get(
                (config.BACKEND_API || "http://localhost:8000") +
                    "/upcoming-exams-limit-5-student",
                { headers }
            );

            // console.log(result);

            if (result.status !== 200) {
                toast.error(result.data.message);
                setisloaderon(false);
                return;
            }

            setUpcomingexams5(Object.values(result.data.upcomingExams));
        } catch (e) {
            console.log(e);
            toast.error(e?.response?.data?.message || "Internal server error");
        }
        setisloaderon(false);

    };

    const fetch_past_exams_5 = async () => {
        setisloaderon(true);

        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.get(
                (config.BACKEND_API || "http://localhost:8000") +
                    "/past-exams-limit-5-student",
                { headers }
            );

            // console.log(result);

            if (result.status !== 200) {
                toast.error(result.data.message);
                setisloaderon(false);
                return;
            }

            setPastexams5(Object.values(result.data.pastExams));
        } catch (e) {
            console.log(e);
            toast.error(e?.response?.data?.message || "Internal server error");
        }
        setisloaderon(false);

    };

    const fetch_upcoming_exams = async () => {
        setisloaderon(true);

        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.get(
                (config.BACKEND_API || "http://localhost:8000") +
                    "/upcoming-exams-student",
                { headers }
            );

            // console.log(result);

            if (result.status !== 200) {
                toast.error(result.data.message);
                setisloaderon(false);
                return;
            }

            setUpcomingexams(Object.values(result.data.upcomingExams));
        } catch (e) {
            console.log(e);
            toast.error(e?.response?.data?.message || "Internal server error");
        }
        setisloaderon(false);

    };

    const fetch_student_performance = async () => {
        setisloaderon(true);

        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.get(
                (config.BACKEND_API || "http://localhost:8000") +
                    "/student-performance",
                { headers }
            );

            // console.log(result);

            if (result.status !== 200) {
                toast.error(result.data.message);
                setisloaderon(false);
                return;
            }
            console.log(result.data.percentage); // Should log a number between 0 and 100
            setPerformance(result.data.percentage);
            console.log(performance);
        } catch (e) {
            console.log(e);
            toast.error(e?.response?.data?.message || "Internal server error");
        }
        setisloaderon(false);

    };

    const change_upcoming_exams_for_month = (month, year) => {
        setUpcomingexamscurmonth([]);

        upcomingexams.forEach((exam) => {
            let curDate = new Date(exam.startTime);
            if (curDate.getMonth() === month && curDate.getFullYear() === year) {
                setUpcomingexamscurmonth((prev) => [...prev, exam]);
            }
        });
    };
    

    const items = [
        { id: "home", label: "Home" },
        { id: "questionbank", label: "Question Bank" },
        { id: "exam", label: "Exam" },
        { id: "results", label: "Results" },
        { id: "profile", label: "Profile" },
    ];

    const handleStudentProfileClose = () => {
        setOpneStudentProfile(false);
        setActiveIndex(0);
    };

    useEffect(() => {
        if (activeIndex == 4) {
            setOpneStudentProfile(true);
        }
    }, [activeIndex]);

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

    const handleClickQuestionBank = () => {
        setActiveIndex(1);
    }

    const formatDate = (date) => {
        date = new Date(date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero
        const day = String(date.getDate()).padStart(2, "0"); // Add leading zero

        return `${day}-${month}-${year}`;
    };

    return (
        <div className="dashboard">
        {isloaderon && <Loading/>}
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
                    <p
                        className="logout"
                        onClick={() => {
                            LogOut();
                        }}
                    >
                        {" "}
                        Log out
                    </p>
                </aside>
            )}

            {/* Main Content */}
            <div className="main-content">
                {/* Top Bar */}
                <header className="top-bar">
                    <span className="welcome-text">
                        Welcome, {Cookies.get("username")}!
                    </span>
                    <img
                        src={user}
                        alt="User profile"
                        className="profile-image"
                        onClick={() => {
                            setActiveIndex(4);
                            setOpneStudentProfile(true);
                        }}
                    />
                </header>

                {/* Content Area */}
                {activeIndex == 0 && (
                    <div className="content">
                        {/* Upcoming Exams */}
                        <div className="firstcol">
                            <div className="upcomingexambox" onClick={()=>setActiveIndex(2)}>
                                <h2>Next 5 Upcoming Exams</h2>
                                <div className="card">
                                    {upcomingexams5.length === 0 ? (
                                        <div className="exam">
                                            <p>No Upcoming Exams Found</p>
                                        </div>
                                    ) : (
                                        upcomingexams5.map((item, index) => (
                                            <div
                                                className="exam"
                                                key={item.examId}
                                            >
                                                <p>
                                                    <strong>
                                                        {item.title}
                                                    </strong>
                                                </p>
                                                <p>Professor: {item.creator}</p>
                                                <p>Subject: {item.subject}</p>
                                                <p>
                                                    Date:{" "}
                                                    {formatDate(item.startTime)}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="practicequestions" onClick={handleClickQuestionBank}>
                                <h1>Practice Questions</h1>
                            </div>
                        </div>

                        {/* Calendar */}

                        <div className="secondcol">
                            <Calendar
                                exams={upcomingexams}
                                changeMonth={change_upcoming_exams_for_month}
                                events={events}
                                setEvents={setEvents}
                                set_events={set_events}
                            />
                            <div className="percentageBox">
                                <div
                                    style={{
                                        width: "200px",
                                        height: "200px",
                                        borderRadius: "50%",
                                        background:
                                            `conic-gradient(#3F72AF 0% ${performance}, #e0e0e0 ${performance})`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "150px",
                                            height: "150px",
                                            borderRadius: "50%",
                                            background:
                                                "conic-gradient(white 0% 100%)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <span>{performance}</span>
                                    </div>
                                </div>
                                <div className="title">Overall Performance</div>
                            </div>
                        </div>

                        <div className="thirdcol">
                            <div className="anonouncementsBox" onClick={()=>setActiveIndex(2)}>
                                <h2>Upcoming Exam For Choosed Month</h2>
                                <div className="card">
                                    {upcomingexamscurmonth.length === 0 ? (
                                        <div className="exam">
                                            <p>
                                                No Upcoming Exams Found This
                                                Month
                                            </p>
                                        </div>
                                    ) : (
                                        upcomingexamscurmonth.map(
                                            (item, index) => (
                                                <div
                                                    className="exam"
                                                    key={item.examId}
                                                >
                                                    <p>
                                                        <strong>
                                                            {item.title}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Professor:{" "}
                                                        {item.creator}
                                                    </p>
                                                    <p>
                                                        Subject: {item.subject}
                                                    </p>
                                                    <p>
                                                        Date:{" "}
                                                        {formatDate(
                                                            item.startTime
                                                        )}
                                                    </p>
                                                </div>
                                            )
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="pastexambox" onClick={()=>setActiveIndex(3)}>
                                <h2>Past 5 Exams</h2>
                                <div className="card">
                                    {pastexams5.length === 0 ? (
                                        <div className="exam">
                                            <p>No Past Exams Found</p>
                                        </div>
                                    ) : (
                                        pastexams5.map((item, index) => (
                                            <div
                                                className="exam"
                                                key={item.examId}
                                            >
                                                <p>
                                                    <strong>
                                                        {item.title}
                                                    </strong>
                                                </p>
                                                <p>Professor: {item.creator}</p>
                                                <p>Subject: {item.subject}</p>
                                                <p>
                                                    Date:{" "}
                                                    {formatDate(item.startTime)}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeIndex == 1 && <QuestionBank />}
                {activeIndex == 2 && (
                    <div className="upcoming-exam-comp">
                        <Upcomingexam exams={upcomingexams} />
                    </div>
                )}

                {activeIndex == 3 && (
                    <div className="past-exam-comp">
                        <PerformanceResultPage />
                    </div>
                )}
                {activeIndex == 4 && opneStudentProfile && (
                    <div className="student-profile-div">
                        <StudentProfile
                            onClose={handleStudentProfileClose}
                            toast={toast}
                            username={username}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
