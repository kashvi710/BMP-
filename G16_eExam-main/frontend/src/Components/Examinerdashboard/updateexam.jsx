import React, { useState, useEffect } from "react";
import "./updateexam.css";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axios from "axios";
import config from "../../config.js";
import { useNavigate } from "react-router-dom";

const UpdateExam = ({ onClose, toast, examId, fetchAgain }) => {
  const [exam, setExam] = useState({});
  const [totalMarks, setTotalMarks] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [showQuestions, setShowQuestions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCancelExamModal, setShowCancelExamModal] = useState(false);
  const [Isclosepage, setIsclosepage] = useState(false);
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("");
  const navigate = useNavigate();
  const [instructions, setInstructions] = useState([]);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState("");
  const [examStatus, setExamStatus] = useState("Pending");

  useEffect(() => {
    if (!Cookies.get("token")) {
      navigate("/");
    } else {
      fetch_exam();
    }
  }, []);

  const fetch_exam = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      };

      const result = await axios.get(
        (config.BACKEND_API || "http://localhost:8000") +
        `/fetch-exam-examiner/${examId}`,
        { headers }
      );

      if (result.status !== 200) {
        toast.error(result.data.message);
        return;
      }

      result.data.exam.questions.map((_, index) => {
        result.data.exam.questions[index].id = index + 1;
      });

      const fetchedExam = result.data.exam;
      setExam(fetchedExam);
      setInstructions(fetchedExam.instructions || []);
      setExamStatus(fetchedExam.status || "Pending");
      const localDateTime = new Date(fetchedExam.startTime);
      setExamDate(localDateTime.toLocaleDateString("en-CA"));
      setExamTime(
        localDateTime.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (e) {
      console.log(e);
      toast.error(e?.response?.data?.message || "Internal server error");
    }
  };

  const delete_exam = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      };

      const result = await axios.delete(
        (config.BACKEND_API || "http://localhost:8000") +
        `/delete-exam/${examId}`,
        { headers }
      );

      if (result.status !== 200) {
        toast.error(result.data.message);
        return;
      }

      toast.success(result.data.message);

      fetchAgain();
      onClose();
    } catch (e) {
      console.log(e);
      toast.error(e?.response?.data?.message || "Internal server error");
    }
  };

  const calculateTotalMarks = () => {
    if (exam?.questions) {
      const sum = exam.questions.reduce(
        (acc, question) => acc + question.points,
        0
      );
      setTotalMarks(sum);
    }
  };
  const handleInstructionChange = (index, value) => {
    setInstructions((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addNewInstruction = () => {
    setInstructions((prev) => [...prev, ""]);
  };
  const deleteInstruction = (index) => {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    calculateTotalMarks();
  }, [exam]);

  const validateDateTime = () => {
    const currentDate = new Date();
    const selectedDateTime = new Date(`${examDate}T${examTime}`);
    if (selectedDateTime <= currentDate) {
      alert("Please select a valid date and time in the future.");
      return false;
    }
    return true;
  };

  const saveExamDetails = async () => {
    if (!exam?.duration || exam.duration < 10) {
      toast.error("Exam duration must be at least 10 minutes.");
      return;
    }
    if (!exam?.title || exam.title.length < 5 || exam.title.length > 50) {
      toast.error("Exam name must be between 5 to 50 characters.");
      return;
    }


    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      };

      const result = await axios.put(
        `${config.BACKEND_API || "http://localhost:8000"
        }/update-exam/${examId}`,
        {
          ...exam,
          startTime: new Date(`${examDate}T${examTime}`).toISOString(),
          status: examStatus,
          instructions,
        },
        { headers }
      );

      if (result.status !== 200) {
        toast.error(result.data.message);
        return;
      }

      toast.success(result.data.message);
      fetchAgain();
      onClose();
    } catch (e) {
      console.log(e);
      toast.error(e?.response?.data?.message || "Internal server error");
    }
  };

  const handleclosepage = () => {
    setIsclosepage(true);
  };

  const handleQuestionSelect = (id) => {
    const question = exam?.questions?.find((q) => q.id === id);
    setSelectedQuestion({ ...question });
    setShowModal(true);
  };

  const handleQuestionUpdate = (field, value) => {
    setSelectedQuestion((prevQuestion) => ({
      ...prevQuestion,
      [field]: value,
    }));
  };

  const handleOptionUpdate = (index, value) => {
    setSelectedQuestion((prevQuestion) => {
      const updatedOptions = [...prevQuestion.options];
      updatedOptions[index] = value;
      return { ...prevQuestion, options: updatedOptions };
    });
  };

  const addOption = () => {
    setSelectedQuestion((prevQuestion) => ({
      ...prevQuestion,
      options: [...prevQuestion.options, ""],
    }));
  };

  const removeOption = (index) => {
    setSelectedQuestion((prevQuestion) => {
      const updatedOptions = prevQuestion.options.filter((_, i) => i !== index);
      return { ...prevQuestion, options: updatedOptions };
    });
  };

  const saveQuestionUpdate = () => {
    if (!selectedQuestion?.desc?.trim()) {
      toast.error("Question text cannot be empty.");
      return;
    }

    const uniqueOptions = new Set(
      selectedQuestion.options.map((opt) => opt.trim())
    );
    if (uniqueOptions.size !== selectedQuestion.options.length) {
      toast.error("Options must be unique.");
      return;
    }

    if (selectedQuestion.options.length < 2) {
      toast.error("A question must have at least two options.");
      return;
    }

    if (!selectedQuestion.difficulty) {
      toast.error("Please select a difficulty level.");
      return;
    }
    if (
      !selectedQuestion.difficulty ||
      selectedQuestion.difficulty === "Select difficulty"
    ) {
      toast.error("Please select a difficulty level.");
      return;
    }
    setExam((prevExam) => ({
      ...prevExam,
      questions: prevExam.questions.map((q) =>
        q.id === selectedQuestion.id ? selectedQuestion : q
      ),
    }));
    setShowModal(false);
    setSelectedQuestion(null);
  };

  const saveNewQuestion = () => {
    if (!selectedQuestion?.desc?.trim()) {
      toast.error("Question text cannot be empty.");
      return;
    }

    const uniqueOptions = new Set(
      selectedQuestion.options.map((opt) => opt.trim())
    );
    if (uniqueOptions.size !== selectedQuestion.options.length) {
      toast.error("Options must be unique.");
      return;
    }

    if (selectedQuestion.options.length < 2) {
      toast.error("A question must have at least two options.");
      return;
    }

    if (!selectedQuestion.difficulty) {
      toast.error("Please select a difficulty level.");
      return;
    }

    setExam((prevExam) => ({
      ...prevExam,
      questions: [
        ...prevExam.questions,
        { ...selectedQuestion, id: prevExam.questions.length + 1 },
      ],
    }));
    setShowModal(false);
    setSelectedQuestion(null);
  };

  const handleDeleteQuestion = (id) => {
    const questionToDelete = exam?.questions?.find((q) => q.id === id);
    if (
      window.confirm(
        `Do you want to delete the question: "${questionToDelete?.desc}"?`
      )
    ) {
      setExam((prevExam) => ({
        ...prevExam,
        questions: prevExam.questions.filter((q) => q.id !== id),
      }));
    }
  };

  const handleCancelExam = () => {
    setShowCancelExamModal(true);
  };

  const confirmCancelExam = async () => {
    try {
      await delete_exam();

      setShowCancelExamModal(false);
      setExam(null);
    } catch (e) {
      console.log(e);
      toast.error(e?.response?.data?.message || "Internal server error");
    }
  };

  const addNewQuestion = () => {
    setSelectedQuestion({
      desc: "",
      options: ["", ""],
      answer: 0,
      points: 1,
      difficulty: "",
    });
    setShowModal(true);
  };

  const handleDateChange = (e) => {
    setExamDate(e.target.value);
  };

  const handleTimeChange = (e) => {
    setExamTime(e.target.value);
  };

  const handleStatusChange = (e) => {
    setExamStatus(e.target.value);
  };

  return (
    <div className="update-exam-div">
      <div className="update-exam-container">
        <h1>Update Exam</h1>
        <label>
          Branch:
          <input
            type="text"
            value={exam?.branch}
            readOnly
            className="readonly-field"
          />
        </label>

        <label>
          Batch:
          <input
            type="text"
            value={exam?.batch}
            readOnly
            className="readonly-field"
          />
        </label>

        <label>
          Semester:
          <input
            type="text"
            value={exam?.semester}
            readOnly
            className="readonly-field"
          />
        </label>
        <label>
          Subject:
          <input
            type="text"
            name="subject"
            value={exam?.subject}
            readOnly
            className="readonly-field"
          />
        </label>
        <div className="exam-details">
          <label>
            Exam Name:
            <input
              type="text"
              name="title"
              value={exam?.title || ""}
              onChange={(e) => setExam({ ...exam, title: e.target.value })}
            />
          </label>

          <label>
            Exam Duration (minutes):
            <input
              type="number"
              name="duration"
              value={exam?.duration}
              onChange={(e) => setExam({ ...exam, duration: e.target.value })}
            />
          </label>

          <label>
            Exam Date:
            <input
              type="date"
              name="date"
              value={examDate}
              onChange={handleDateChange}
            />
          </label>

          <label>
            Exam Time:
            <input
              type="time"
              name="time"
              value={examTime}
              onChange={handleTimeChange}
            />
          </label>

          <label>
            Total Marks: <b>{totalMarks}</b>
          </label>
          <label>
            Status:
            <select
              value={examStatus}
              onChange={handleStatusChange}
              className="status-dropdown"
            >
              <option value="Pending">Pending</option>
              <option value="Published">Published</option>
            </select>
          </label>

          <div className="buttons-container">
            <button
              className="edit-questions-btn"
              onClick={() => setShowQuestions(!showQuestions)}
            >
              Edit Questions
            </button>
            <button className="add-question-btn" onClick={addNewQuestion}>
              Add Question
            </button>
            <button
              className="edit-instructions-btn"
              onClick={() => setShowInstructionsModal(true)}
            >
              Edit Instructions
            </button>

            <button className="cancel-exam-btn" onClick={handleCancelExam}>
              Cancel Exam
            </button>
          </div>

          {showQuestions && (
            <div className="update-questions">
              <ul>
                {exam?.questions &&
                  exam.questions.map((question, index) => (
                    <li key={index}>
                      <div className="question-item">
                        <span>{question?.desc}</span>
                        <button
                          className="update-btn"
                          onClick={() => handleQuestionSelect(question?.id)}
                        >
                          Update
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteQuestion(question?.id)}
                          style={{ marginLeft: "10px" }}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div className="buttons-container">
            <button className="save-btn" onClick={saveExamDetails}>
              Save Exam Details
            </button>
            <button className="closebtn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        {showModal && selectedQuestion && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>
                {selectedQuestion.id ? "Edit Question" : "Add New Question"}
              </h3>
              <label>
                Question Text:
                <textarea
                  value={selectedQuestion?.desc}
                  onChange={(e) => handleQuestionUpdate("desc", e.target.value)}
                />
              </label>

              <label>Options:</label>
              <div className="options-container">
                {selectedQuestion?.options &&
                  selectedQuestion.options.map((option, index) => (
                    <div key={index} className="option-item">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionUpdate(index, e.target.value)
                        }
                      />
                      <input
                        type="radio"
                        name="answer"
                        checked={selectedQuestion?.answer === index}
                        onChange={() => handleQuestionUpdate("answer", index)}
                      />
                      <button
                        className="remove-btn"
                        onClick={() => {
                          if (selectedQuestion.options.length > 2) {
                            removeOption(index);
                          } else {
                            alert("A question must have at least two options.");
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
              </div>
              <button className="add-option-btn" onClick={addOption}>
                Add Option
              </button>
              <label>
                Marks:
                <input
                  type="number"
                  value={selectedQuestion?.points}
                  onChange={(e) =>
                    handleQuestionUpdate("points", parseInt(e.target.value, 10))
                  }
                />
              </label>
              <label>
                Difficulty:
                <select
                  value={selectedQuestion?.difficulty || "Select difficulty"}
                  onChange={(e) =>
                    handleQuestionUpdate("difficulty", e.target.value)
                  }
                >
                  <option value="Select difficulty" disabled>
                    Select difficulty
                  </option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </label>

              <div className="modal-buttons">
                <button
                  className="save-question-btn"
                  onClick={
                    selectedQuestion?.id ? saveQuestionUpdate : saveNewQuestion
                  }
                >
                  Save
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedQuestion(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showInstructionsModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Edit Instructions</h3>
              <ul>
                {instructions.map((instruction, index) => (
                  <li key={index} className="instruction-item">
                    <input
                      type="text"
                      value={instruction}
                      onChange={(e) =>
                        handleInstructionChange(index, e.target.value)
                      }
                    />
                    <button
                      className="delete-instruction-btn"
                      onClick={() => deleteInstruction(index)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
              <button
                className="add-instruction-btn"
                onClick={addNewInstruction}
              >
                Add New Instruction
              </button>
              <div className="modal-buttons">
                <button
                  className="save-instructions-btn"
                  onClick={() => setShowInstructionsModal(false)}
                >
                  Save
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setShowInstructionsModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showCancelExamModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Cancel Exam</h3>
              <p>Are you sure you want to cancel this exam?</p>
              <div className="modal-buttons">
                <button className="confirm-btn" onClick={confirmCancelExam}>
                  Yes, Cancel
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setShowCancelExamModal(false)}
                >
                  No, Keep
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateExam;
