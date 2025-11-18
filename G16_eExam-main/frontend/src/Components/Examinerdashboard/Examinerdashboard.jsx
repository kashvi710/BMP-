import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./Examinerdashboard.css";
import logo from "../assets/logo.png";
import user from "../assets/user.png";
import { useAuth } from "../../context/auth.jsx";
import CreateExam from "../CreateExam/CreateExam.jsx";
import ExamResults from "./ExamResults.jsx";
import Examreport from "../ResultPage/Examreport.jsx";
import FetchedQuestions from "../Questions/FetchedQuestions.jsx";
import UpdateExam from "./updateexam.jsx";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axios from "axios";
import config from "../../config.js";
import ExaminerProfile from "../../Components/Profile/ExaminerProfile.jsx";
import Loading from "../Loader/Loding.jsx"



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

function Examinerdashboard() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 700);
    const { setIsLoggedIn, validateUser, LogOut, isLoggedIn } = useAuth();
    const [iscreateexamopen, setiscreateexamopen] = useState(false);
    const [iscreateQuestionopen, setiscreateQuestionopen] = useState(false);
    const navigate = useNavigate();
    // const [isprofileopen, setisprofileopen] = useState(false);
    const [isresultopen, setisresultopen] = useState(false);
    const [isOpenQuestion, setisOpenQuestion] = useState(false);
    const [iseditExam, setisEditExam] = useState(false);
    const [username, setUsername] = useState(null);

    const [events, setEvents] = useState([]);
    const [upcomingexams5, setUpcomingexams5] = useState([]);
    const [pastexams5, setPastexams5] = useState([]);
    const [upcomingexams, setUpcomingexams] = useState([]);
    const [upcomingexamscurmonth, setUpcomingexamscurmonth] = useState([]);
    const [opneExaminerProfile, setOpneExaminerProfile] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [allquestions, setAllQuestions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [subject, setSubject] = useState("");

    const [pastexamsofexaminer, setpastexamsofexaminer] = useState([]);
    const [upcomingexamsofexaminer, setupcomingexamsofexaminer] = useState([]);

    const [currExam, setCurrExam] = useState("");
    const [isloaderon, setisloaderon] = useState(false);


    useEffect(() => {
        if (
            !Cookies.get("token") ||
            !Cookies.get("role") ||
            Cookies.get("role") === "Admin"
        ) {
            navigate("/");
        } else {
            setUsername(Cookies.get("username"));
            fetch_upcoming_exams();
            fetch_upcoming_exams_5();
            fetch_past_exams_5();
            fetch_all_questions();
            fetch_upcoming_exams_of_examiner();
            fetch_past_exams_of_examiner();
        }
    }, []);

    const formatDateYY = (date) => {
        date = new Date(date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0"); 

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
                    "/upcoming-exams-limit-5-examiner",
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
                    "/past-exams-limit-5-examiner",
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
                    "/upcoming-exams",
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

    const fetch_upcoming_exams_of_examiner = async () => {
        setisloaderon(true);

        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.get(
                (config.BACKEND_API || "http://localhost:8000") +
                    "/upcoming-exams-examiner",
                { headers }
            );

            // console.log(result);

            if (result.status !== 200) {
                toast.error(result.data.message);
                setisloaderon(false);
                return;
            }

            setupcomingexamsofexaminer(Object.values(result.data.upcomingExams));
        } catch (e) {
            console.log(e);
            toast.error(e?.response?.data?.message || "Internal server error");
        }
        setisloaderon(false);

    };

    const fetch_past_exams_of_examiner = async () => {
        setisloaderon(true);
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.get(
                (config.BACKEND_API || "http://localhost:8000") +
                    "/past-exams-examiner",
                { headers }
            );

            // console.log(result);

            if (result.status !== 200) {
                toast.error(result.data.message);
                setisloaderon(false);
                return;
            }

            setpastexamsofexaminer(Object.values(result.data.pastExams));
        } catch (e) {
            console.log(e);
            toast.error(e?.response?.data?.message || "Internal server error");
        }
        setisloaderon(false);

    };

    const getSubjectsArray = (questions) => {
        const subjects = [
            ...new Set(
                questions.map((question) => question.subject || "Uncategorized")
            ),
        ];
        return subjects;
    };

    const fetch_all_questions = async () => {
        setisloaderon(true);

        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.get(
                (config.BACKEND_API || "http://localhost:8000") +
                    "/all-questions-examiner",
                { headers }
            );

            // console.log(result);

            if (result.status !== 200) {
                toast.error(result.data.message);
                setisloaderon(false);
                return;
            }

            setAllQuestions(Object.values(result.data.questions));
            setSubjects(getSubjectsArray(Object.values(result.data.questions)));
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

    useEffect(() => {
        setQuestions(allquestions.filter((q) => q.subject === subject));
    }, [subject])

    const items = [
        { id: "home", label: "Home" },
        { id: "question", label: "Questions" },
        { id: "Upcoming Exam", label: "Upcoming Exam" },
        { id: "Past Exam", label: "Past Exam" },
        { id: "profile", label: "Profile" },
    ];

    const handleExaminerProfileClose = () => {
        setOpneExaminerProfile(false);
        setActiveIndex(0);
    };

    const formatDate = (date) => {
        date = new Date(date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero
        const day = String(date.getDate()).padStart(2, "0"); // Add leading zero

        return `${day}-${month}-${year}`;
    };

    useEffect(() => {
        if (activeIndex == 4) {
            setOpneExaminerProfile(true);
        }
    }, [activeIndex]);

    const handleCreateExam = () => {
        setiscreateexamopen(true);
    };

    const handleCloseCreateExam = () => {
        setiscreateexamopen(false);
    };

    const handleEditExam = () => {
        setisEditExam(true);
    };


    const handleopenprofile = () => {
        setActiveIndex(4);
        setOpneExaminerProfile(true);
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
    
    const getDate = (datetime) => {
        const date = new Date(datetime);
        return date.toLocaleDateString();
    };

    const getTime = (datetime) => {
        const date = new Date(datetime);
        return date.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
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
                        onClick={handleopenprofile}
                    />
                </header>

                {/* Content Area */}
                {activeIndex == 0 && (
                    <div className="content">
                        {/* Upcoming Exams */}
                        <div className="firstcol">
                            <div
                                className="upcomingexambox"
                                onClick={() => setActiveIndex(2)}
                            >
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
                        </div>

                        <div className="thirdcol">
                            <div className="anonouncementsBox" onClick={() => setActiveIndex(2)}>
                                <h2>Upcoming Exams For Choosed Month</h2>
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
                            <div
                                className="pastexambox"
                                onClick={() => setActiveIndex(3)}
                            >
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

                {activeIndex == 1 &&
                    !isOpenQuestion &&
                    !iscreateQuestionopen && (
                        <div className="Examiner-subject-grid-container">
                            {subjects.length ? (
                                subjects.map((subject, index) => (
                                    <div
                                        className="subject"
                                        key={index}
                                        onClick={() => {
                                            setisOpenQuestion(true);
                                            setSubject(subject);
                                        }}
                                    >
                                        {subject}
                                    </div>
                                ))
                            ) : (
                                <div>No Questions Found</div>
                            )}
                            <button
                                className="create-examiner-button"
                                onClick={() => setiscreateQuestionopen(true)}
                            >
                                + Create Question
                            </button>
                        </div>
                    )}

                {activeIndex == 1 &&
                    isOpenQuestion &&
                    !iscreateQuestionopen && (
                        <div>
                            <div className="Examiner-Question-grid-container">
                                {questions.map((question, index) => (
                                    <div
                                        className="question-card"
                                        key={index}
                                    >
                                        <div className="question-header">{`Q${index+1}: ${question.desc}`}</div>
                                        <div className="options">
                                            {questions.length ? question.options.map(
                                                (option, index) => (
                                                    <div
                                                        className="option"
                                                        key={index}
                                                    >
                                                        {String.fromCharCode(
                                                            65 + index
                                                        ) +
                                                            ". " +
                                                            option}
                                                    </div>
                                                )
                                            ): 
                                            <div>No Questions Found</div>}
                                        </div>
                                        <div className="metadata">
                                            <span>{`Answer: ${question.options[question.answer]}`}</span>
                                            <span>{`Difficulty: ${question.difficulty}`}</span>
                                            <span>{`Points: ${question.points}`}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                className="create-examiner-button"
                                onClick={() => setisOpenQuestion(false)}
                            >
                                Close
                            </button>
                        </div>
                    )}

                {activeIndex == 1 &&
                    !isOpenQuestion &&
                    iscreateQuestionopen && (
                        <>
                            <FetchedQuestions onClose={setiscreateQuestionopen} subjects={subjects} setSubjects={setSubjects} setQuestions={setAllQuestions}/>
                            <button
                                className="create-examiner-button"
                                onClick={() => setiscreateQuestionopen(false)}
                            >
                                Close
                            </button>
                        </>
                    )}

                {activeIndex == 2 && !iscreateexamopen && (
                    <div>
                        <div className="exam-grid">
                            {upcomingexamsofexaminer.length ? upcomingexamsofexaminer.map((exam, index) => (
                                <div className="exam-card" key={index}>
                                    <h3>{exam.title}</h3>
                                    <p>
                                        <strong>Subject:</strong> {exam.subject}
                                    </p>
                                    <p>
                                        <strong>Duration:</strong>{" "}
                                        {exam.duration} minutes
                                    </p>
                                    <p>
                                        <strong>Start Date:</strong>{" "}
                                        {getDate(exam.startTime)}
                                    </p>
                                    <p>
                                        <strong>Start Time:</strong>{" "}
                                        {getTime(exam.startTime)}
                                    </p>
                                    <p>
                                        <strong>No. of Questions:</strong>{" "}
                                        {exam.questions.length}
                                    </p>
                                    <button
                                        className="exam-grid-editbtn"
                                        onClick={() => {handleEditExam(); setCurrExam(exam)}}
                                    >
                                        Edit
                                    </button>
                                </div>
                            )): <div>No Upcoming Exams</div>}
                        </div>
                        <button
                            className="create-examiner-button"
                            onClick={handleCreateExam}
                        >
                            + Create Exam
                        </button>
                    </div>
                )}
                {activeIndex == 2 && iscreateexamopen && (
                    <div className="CreateExam-comp">
                        <CreateExam onClose={handleCloseCreateExam} questionBank={allquestions} setQuestionBank={setAllQuestions} toast={toast} fetchAgain={() => {fetch_upcoming_exams_of_examiner(); fetch_all_questions();}}/>
                        <button
                            className="create-examiner-button"
                            onClick={handleCloseCreateExam}
                        >
                            Close
                        </button>
                    </div>
                )}
                {activeIndex == 3 && !isresultopen && (
                    <div>
                        <div className="exam-grid">
                            {pastexamsofexaminer.length ? pastexamsofexaminer.map((exam, index) => (
                                <div className="exam-card" key={index}>
                                    <h3>{exam.title}</h3>
                                    <p>
                                        <strong>Subject:</strong> {exam.subject}
                                    </p>
                                    <p>
                                        <strong>Duration:</strong>{" "}
                                        {exam.duration} minutes
                                    </p>
                                    <p>
                                        <strong>Start Date:</strong>{" "}
                                        {getDate(exam.startTime)}
                                    </p>
                                    <p>
                                        <strong>Start Time:</strong>{" "}
                                        {getTime(exam.startTime)}
                                    </p>
                                    <p>
                                        <strong>No. of Questions:</strong>{" "}
                                        {exam.questions.length}
                                    </p>
                                    <button
                                        className="exam-grid-resultbtn"
                                        onClick={() => {setisresultopen(true), setCurrExam(exam)}}
                                    >
                                        Result
                                    </button>
                                    
                                </div>
                            )): <div>No Past Exams</div>}
                        </div>
                    </div>
                )}
                {activeIndex == 3 && isresultopen && (
                    <div>
                        <ExamResults
                            exam={currExam}
                        />
                        <button
                            className="create-examiner-button"
                            onClick={() => setisresultopen(false)}
                        >
                            Close
                        </button>
                    </div>
                )}
                {iseditExam && (
                    <UpdateExam onClose={() => setisEditExam(false)} toast={toast} examId={currExam.examId} fetchAgain={() => {fetch_upcoming_exams_of_examiner(); fetch_all_questions();}}/>
                )}
                {activeIndex == 4 && opneExaminerProfile && (
                    <div className="student-profile-div">
                        <ExaminerProfile
                            onClose={handleExaminerProfileClose}
                            toast={toast}
                            username={username}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Examinerdashboard;
