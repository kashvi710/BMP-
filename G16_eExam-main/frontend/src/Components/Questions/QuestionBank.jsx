import React, { useState, useEffect } from "react";
import "./QuestionBank.css";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../config.js";
import axios from "axios";
import Loading from "../Loader/Loding.jsx"

const QuestionBank = () => {
    const [questions, setQuestions] = useState([]);
    const [isSubjectSelected, setIsSubjectSelected] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
    const [showBookmarks, setShowBookmarks] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [popupQuestion, setPopupQuestion] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [subjectQuestions, setSubjectQuestions] = useState({});
    const navigate = useNavigate();
    const [isloaderon, setisloaderon] = useState(false);



    useEffect(() => {
        if (!Cookies.get("token") || !Cookies.get("username")) {
            navigate("/");
        } else {
            fetch_questions();
        }
    }, []);

    const fetch_questions = async () => {
        setisloaderon(true);

        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const result = await axios.get(
                (config.BACKEND_API || "http://localhost:8000") +
                    "/all-questions-student",
                { headers }
            );

            // console.log(result);

            if (result.status !== 200) {
                toast.error(result.data.message);
                setisloaderon(false);
                return;
            }

            // console.log(result.data.groupedQuestions);

            const subjectWiseQuestionsArray = Object.values(
                result.data.groupedQuestions
            );

            subjectWiseQuestionsArray.forEach((item) => {
                setSubjectQuestions((prev) => ({
                    ...prev,
                    [item.subject]: item.questions,
                }));
            });
        } catch (e) {
            console.log(e);
            toast.error(e?.response?.data?.message || "Internal Server Error");
        }
        setisloaderon(false);

    };

    const loadQuestionsBySubject = (subject) => {
        setQuestions(subjectQuestions[subject]);
        setSelectedSubject(subject);
        setIsSubjectSelected(true);
        setShowBookmarks(false);
        setSelectedDifficulty("");
    };

    const toggleBookmark = (question) => {
        setBookmarkedQuestions((prev) => {
            const isAlreadyBookmarked = prev.find((q) => q.questionId === question.questionId);
            if (isAlreadyBookmarked) {
                return prev.filter((q) => q.questionId !== question.questionId);
            } else {
                return [...prev, question];
            }
        });
    };

    const closeQuestionPage = () => {
        setQuestions([]);
        setIsSubjectSelected(false);
        setSelectedSubject("");
        setSelectedDifficulty("");
    };

    const showBookmarkPage = () => {
        setQuestions(bookmarkedQuestions);
        setIsSubjectSelected(true);
        setShowBookmarks(true);
        setSelectedDifficulty("");
    };

    const handleDifficultyChange = (event) => {
        setSelectedDifficulty(event.target.value);
    };

    const filteredQuestions = selectedDifficulty
        ? questions.filter(
              (question) => question.difficulty === selectedDifficulty
          )
        : questions;

    const openPopup = (question) => {
        setPopupQuestion(question);
        setSelectedOption(null);
        setFeedback("");
    };

    const closePopup = () => {
        setPopupQuestion(null);
        setSelectedOption(null);
        setFeedback("");
    };

    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const handleSubmit = () => {
        if (!selectedOption) {
            setFeedback("Please select an option.");
            return;
        }

        if (selectedOption === popupQuestion.options[popupQuestion.answer]) {
            setFeedback("Correct! 🎉");
        } else {
            setFeedback(
                `Incorrect. The correct answer is: ${popupQuestion.options[popupQuestion.answer]}`
            );
        }
    };

    const handleBookmark = async (question) => {
        setisloaderon(true);

        try{
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
            };

            const isAlreadyBookmarked = bookmarkedQuestions.find((q) => q.questionId === question.questionId);

            const result = await axios.post(
                (config.BACKEND_API || "http://localhost:8000") +
                `${isAlreadyBookmarked ? "/delete-bookmark-question" : "/add-bookmark-question"}`,
                {
                    questionId: question.questionId
                },
                { headers }
            );

            // console.log(result);

            if (result.status !== 200) {
                toast.error(result.data.message);
                setisloaderon(false);
                return;
            }

            toggleBookmark(question);
            toast.success(result.data.message)
        }catch(e){
            console.log(e);
            toast.error((e?.response?.data?.message) || ("Internal server error"));
        }

        setisloaderon(false);

        
    };

    return (
        <div className="question-bank-div">
        {isloaderon && <Loading/>}
            <h2 className="title">Question Bank</h2>
            <center>
                {Object.keys(subjectQuestions).length === 0 && <div>No Questions Found</div>}
                {!isSubjectSelected ? (
                    <div className="subject-boxes">
                        {Object.keys(subjectQuestions).map((subject, index) => (
                            <button
                                key={index}
                                onClick={() => loadQuestionsBySubject(subject)}
                                className="subject-box"
                            >
                                {subject}
                            </button>
                        ))}
                        <button
                            onClick={showBookmarkPage}
                            className="bookmark-box"
                        >
                            Bookmarks
                        </button>
                    </div>
                ) : (
                    <>
                        <h3>
                            {showBookmarks
                                ? "Bookmarked Questions"
                                : `${selectedSubject} Questions`}
                        </h3>
                        <div className="filter-container">
                            <label
                                htmlFor="difficulty-select"
                                className="filter-label"
                            >
                                Filter by Difficulty:
                            </label>
                            <select
                                id="difficulty-select"
                                value={selectedDifficulty}
                                onChange={handleDifficultyChange}
                                className="filter-select"
                            >
                                <option value="">All</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                        <div className="questions-list-div">
                            <ul className="questions-list">
                                {filteredQuestions.map((question, index) => (
                                    <li key={index} className="question-item">
                                        <div className="question-content">
                                            <p className="question-text">
                                                <span className="question-number">
                                                    Question {index + 1}:
                                                </span>{" "}
                                                {question.desc}
                                            </p>
                                            <p className="question-difficulty">
                                                Difficulty:{" "}
                                                {question.difficulty}
                                            </p>
                                            <p>Points: {question.points}</p>
                                        </div>
                                        <button
                                            onClick={() => openPopup(question)}
                                            className="view-answer-button"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleBookmark(question)
                                            }
                                            className="bookmark-button"
                                        >
                                            {bookmarkedQuestions.find(
                                                (q) => q.questionId === question.questionId
                                            )
                                                ? "★"
                                                : "☆"}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button
                            onClick={closeQuestionPage}
                            className="close-button"
                        >
                            Close
                        </button>
                    </>
                )}
            </center>

            {popupQuestion && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Question Details</h3>
                        <p>
                            <strong>Question:</strong> {popupQuestion.desc}
                        </p>
                        <p>
                            <strong>Options:</strong>
                        </p>
                        <ul>
                            {popupQuestion.options.map((option, idx) => (
                                <li key={idx} className="popup-content-li">
                                    <label className="question-option-label">
                                        <input
                                            type="radio"
                                            name="options"
                                            value={option}
                                            onChange={() =>
                                                handleOptionChange(option)
                                            }
                                            checked={selectedOption === option}
                                        />
                                        <p>{option}</p>
                                    </label>
                                </li>
                            ))}
                        </ul>
                        <div className="pop-up-bottom">
                            <button
                                onClick={handleSubmit}
                                className="submit-button"
                            >
                                Submit
                            </button>
                            {feedback && <p className="feedback">{feedback}</p>}
                            <button
                                onClick={closePopup}
                                className="close-button"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBank;
