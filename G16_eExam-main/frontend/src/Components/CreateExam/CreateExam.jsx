import React, { useState, useEffect } from "react";
import "./CreateExam.css";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axios from "axios";
import config from "../../config.js";
import Loading from "../Loader/Loding.jsx";

const CreateExam = ({ onClose, questionBank, toast, fetchAgain }) => {
  const [step, setStep] = useState(1);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [isloaderon, setisloaderon] = useState(false);

  // Step 1: Basic Details
  const [examTitle, setExamTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [degree, setDegree] = useState("B.Tech");
  const [semester, setSemester] = useState("");
  const [totalmarks, settotalmarks] = useState(0);
  const [examType, setExamType] = useState(""); // Default: "Select Exam Type"
  const [status, setStatus] = useState(""); // Default: "Select Status"
  const [Branch, setBranch] = useState(""); // Default: "Select Branch"

  const [instructions, setInstructions] = useState([]); // To store multiple instructions

  // Step 2: Timing Details
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [difficulty, setDifficulty] = useState("");

  // Step 3: Questions
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [numOptions, setNumOptions] = useState("");
  const [correctOption, setCorrectOption] = useState(null);
  const [points, setpoints] = useState(null);
  const [currentOptions, setCurrentOptions] = useState(Array(2).fill(""));
  const [instructionInput, setInstructionInput] = useState(""); // For input field

  useEffect(() => {
    // Adjust the options array whenever the number of options changes
    setCurrentOptions((prevOptions) => {
      const updatedOptions = [...prevOptions];
      while (updatedOptions.length < numOptions) {
        updatedOptions.push(""); // Add empty options if increasing
      }
      return updatedOptions.slice(0, numOptions); // Trim excess options if decreasing
    });
  }, [numOptions]);

  const handleAddInstruction = () => {
    if (!instructionInput.trim())
      return toast.error("Instruction cannot be empty!");
    setInstructions([...instructions, instructionInput.trim()]);
    setInstructionInput(""); // Clear input
  };

  const handleDeleteInstruction = (index) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };
  const handleClearExam = () => {
    setExamTitle("");
    setSubject("");
    setBranch("");
    setSemester("");
    setDuration("");
    setDate("");
    setStartTime("");
    setStatus("Pending");
    setInstructions([]);
    setQuestions([]);
    settotalmarks("");
    setDifficulty("Easy");
    setCurrentQuestion("");
    setNumOptions("");
    setCorrectOption(null);
    setCurrentOptions(Array(numOptions).fill(""));
    toast.success("Exam cleared successfully!");
  };

  // Modal for Question Bank
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBankQuestions, setSelectedBankQuestions] = useState([]);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [batch, setBatch] = useState("");

  // Handlers
  const handleNext = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handlePrevious = () => {
    setStep((prevStep) => prevStep - 1);
  };
  const allOptionsFilled = currentOptions.every(
    (option) => option.trim() !== ""
  );
  const handleAddQuestion = () => {
    const parsedPoints = parseInt(points, 10);
    if (
      !currentQuestion ||
      correctOption === null ||
      isNaN(parsedPoints) ||
      !allOptionsFilled
    ) {
      toast.error("Please enter valid question details.");
      return;
    }
    if (!difficulty) {
      toast.error("Please enter difficulty of the question.");
      return;
    }
    const uniqueOptions = new Set(currentOptions.map((opt) => opt.trim()));
    if (uniqueOptions.size !== currentOptions.length) {
      toast.error("Options must be unique.");
      return;
    }
    const newQuestion = {
      desc: currentQuestion,
      options: [...currentOptions],
      answer: correctOption,
      points: parsedPoints, // Ensure points is a number
      difficulty,
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion("");
    setCurrentOptions(Array(2).fill(""));
    setCorrectOption(null);
    setpoints(""); // Reset points to empty string
  };

  const handleDeleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBankQuestions([]);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleQuestionSelect = (question) => {
    if (
      selectedBankQuestions.some((q) => q.questionId === question.questionId)
    ) {
      // If question is already selected, deselect it
      setSelectedBankQuestions((prev) =>
        prev.filter((q) => q.questionId !== question.questionId)
      );
    } else {
      // If not selected, add it to the selection
      setSelectedBankQuestions((prev) => [...prev, question]);
    }
  };

  const handleAddSelectedQuestions = () => {
    setQuestions([...questions, ...selectedBankQuestions]);
    handleCloseModal();
  };

  const mergeDateAndTimeIST = (date, time) => {
    // Combine the date and time strings
    const dateTimeString = `${date}T${time}:00`;

    // Create a new Date object from the combined string
    const mergedDate = new Date(dateTimeString);

    if (isNaN(mergedDate)) {
      toast.error("Invalid date or time format.");
    }

    const istDate = new Date(mergedDate.getTime());

    return istDate;
  };

  const handleSubmitExam = async () => {
    if (examTitle && subject && Branch && semester && questions.length) {
      const examData = {
        title: examTitle,
        subject,
        batch,
        branch: Branch,
        duration,
        semester,
        startTime: mergeDateAndTimeIST(date, startTime),
        questions,
        total_points: totalmarks,
        difficulty,
        instructions, // Pass the array of instructions
        examType: examType == "Insem 1" ? 1 : examType == "Insem 2" ? 2 : 3,
        status, // Include status here
      };
      if (!examType || examType === "Select Examtype") {
        toast.error("Please select a valid Exam Type.");
        return;
      }
      if (duration < 10) {
        toast.error("Duration should be greater than 10 minutes");
        return;
      }
      if (!status || status === "Select Status") {
        toast.error("Please select a valid Exam Status.");
        return;
      }
      if (!Branch || Branch === "Select Branch") {
        toast.error("Please select a valid Branch.");
        return;
      }
      if(examTitle.length < 5 ||
        examTitle.length > 50)
        {
          toast.error("ExamTitle Must be between 5 to 30 character!!");
        }
      if (
        subject.length < 5 ||
        subject.length > 50
      ) {
        toast.error(
          "Subject Must be between 5 to 30 character!!"
        );
        return;
      }
      if (batch < 2020 || batch > 2028) {
        toast.error("Batch must be between 2020 and 2028.");
        return;
      }
      console.log(examData);

      //   console.log(examData);

      setisloaderon(true);
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        };

        const result = await axios.post(
          (config.BACKEND_API || "http://localhost:8000") + "/create-exam",
          examData,
          { headers }
        );

        // console.log(result);

        if (result.status !== 200) {
          toast.error(result.data.message);
          setisloaderon(false);
          return;
        }

        toast.success(result.data.message);
        onClose();
        fetchAgain();

        // Reset all fields
        settotalmarks("");
        setExamTitle("");
        setSubject("");
        setBranch("");
        setSemester("");
        setDuration("");
        setDate("");
        setStartTime("");
        setInstructions(""); // Reset instructions
        setQuestions([]);
        setStep(1);
        setBatch(""); // Reset batch
      } catch (e) {
        console.log(e);
        toast.error(e?.response?.data?.message || "Internal server error");
      }
    } else {
      toast.error("Please complete all fields and add at least one question.");
    }
    setisloaderon(false);
  };

  useEffect(() => {
    setFilteredQuestions(
      questionBank.filter(
        (q) =>
          q.desc.toLowerCase().includes(searchQuery.toLowerCase()) &&
          q.subject.toLowerCase() === subject.toLowerCase() // Match subject exactly
      )
    );
  }, [questionBank, searchQuery, subject]);

  useEffect(() => {
    const sum = questions.reduce(
      (acc, question) => acc + (question.points || 0),
      0
    );
    settotalmarks(sum); // sum will always be a number
  }, [questions]);

  return (
    <div className="create-exam-container">
      {isloaderon && <Loading />}
      <div className="create-exam-form">
        {step === 1 && (
          <div className="step-one">
            <h2>Step 1: Basic Details</h2>
            <input
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              placeholder="Exam Title"
            />

            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
            >
              <option value="" disabled>
                Select Examtype
              </option>
              <option value="Insem1">Insem 1</option>
              <option value="Insem2">Insem 2</option>
              <option value="Endsem">Endsem</option>
            </select>
            <input
              type="number"
              value={batch} // Add input for batch
              onChange={(e) => setBatch(e.target.value)}
              placeholder="Batch (e.g., 2022)"
              min="1900" // Optional: set minimum year for validation
              step="1" // Optional: increments by 1
            />
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
            />
            <select value={Branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="" disabled>
                Select Branch
              </option>
              <option value="ICT">
                Information and Communication Technology
              </option>
              <option value="CS">Computer Science</option>
              <option value="MnC">Mathematics and Computation</option>
              <option value="EVD">Electronics and VLSI Design</option>
            </select>
            <input
              type="number"
              value={semester}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if ((value >= 1 && value <= 8) || e.target.value === "") {
                  setSemester(e.target.value); // Allow positive values or empty string
                }
              }}
              placeholder="Semester"
              min="1"
            />

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="" disabled>
                Select Status
              </option>
              <option value="Published">Published</option>
              <option value="Pending">Pending</option>
            </select>

            <div className="instructions-input">
              <input
                type="text"
                value={instructionInput}
                onChange={(e) => setInstructionInput(e.target.value)}
                placeholder="Enter an instruction"
              />
              <button onClick={handleAddInstruction}>Add Instruction</button>
            </div>
            <button onClick={handleNext}>Next</button>
          </div>
        )}

        {step === 2 && (
          <div className="step-two">
            <h2>Step 2: Timing Details</h2>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duration (in minutes)"
              min="10"
              step="1"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <button onClick={handlePrevious}>Previous</button>
            <button onClick={handleNext}>Next</button>
          </div>
        )}

        {step === 3 && (
          <div className="step-three">
            <h2>Step 3: Add Questions</h2>
            <input
              type="text"
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              placeholder="Question Text"
            />
            <input
              type="number"
              value={points}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 || e.target.value === "") {
                  setpoints(e.target.value); // Allow positive values or empty string
                }
              }}
              placeholder="Points"
              min="1"
            />

            <input
              type="number"
              value={numOptions}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 2 || e.target.value === "") {
                  setNumOptions(e.target.value); // Allow positive values or empty string
                }
              }}
              placeholder="Number of Options"
              min="2"
            />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="" disabled>
                Select Difficulty
              </option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <div className="option-div">
              {Array.from({ length: numOptions }).map((_, index) => (
                <div key={index} className="option-input">
                  <input
                    className="option-input-input"
                    type="radio"
                    name="correctOption"
                    checked={correctOption === index}
                    onChange={() => setCorrectOption(index)}
                  />
                  <input
                    className="option-input-option"
                    type="text"
                    value={currentOptions[index] || ""}
                    onChange={(e) =>
                      setCurrentOptions((prevOptions) =>
                        prevOptions.map((opt, i) =>
                          i === index ? e.target.value : opt
                        )
                      )
                    }
                    placeholder={`Option ${index + 1}`}
                  />
                </div>
              ))}
            </div>

            <button className="create-exam-btn1" onClick={handleAddQuestion}>
              Add Question
            </button>
            <button className="create-exam-btn1" onClick={handleOpenModal}>
              Add from Question Bank
            </button>
            <button className="create-exam-btn1" onClick={handlePrevious}>
              Previous
            </button>
            <button className="create-exam-btn1" onClick={handleSubmitExam}>
              Submit Exam
            </button>
          </div>
        )}
      </div>

      {/* Exam Preview */}
      <div className="exam-preview">
        <h3>Exam Preview</h3>
        <div className="exam-preview-container">
          <button
            className="view-instructions-btn"
            onClick={() => setShowInstructionsModal(true)}
          >
            View Instructions
          </button>
          <p>
            <strong>Title:</strong> {examTitle}
          </p>
          <p>
            <strong>Exam Type:</strong> {examType}
          </p>
          <p>
            <strong>Subject:</strong> {subject}
          </p>
          <p>
            <strong>Branch:</strong> {Branch}
          </p>
          <p>
            <strong>Semester:</strong> {semester}
          </p>
          <p>
            <strong>Duration:</strong> {duration}
          </p>
          <p>
            <strong>Date:</strong> {date}
          </p>
          <p>
            <strong>Status:</strong> {status}
          </p>
          <p>
            <strong>Start Time:</strong> {startTime}
          </p>
          <p>
            <strong>Total Marks:</strong> {totalmarks}
          </p>
          <p>
            <strong>Batch:</strong> {batch}
          </p>
          <h4>Questions:</h4>
          {questions.map((q, index) => (
            <div key={index} className="question-preview">
              <p>
                Q{index + 1}: {q.desc} (Points: {q.points} Difficulty:{" "}
                {q.difficulty})
                <button
                  className="exam-preview-deletebtn"
                  onClick={() => handleDeleteQuestion(index)}
                >
                  Delete
                </button>
              </p>
              <ul>
                {q.options.map((option, i) => (
                  <li
                    key={i}
                    className={q.correctOption === i ? "correct-option" : ""}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <button className="clear-exam-btn" onClick={handleClearExam}>
            Clear Exam
          </button>
        </div>

        {/* Modal for Question Bank */}
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h2>Question Bank</h2>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search questions..."
              />

              <div className="question-bank">
                {filteredQuestions.map((question) => {
                  return (
                    <label key={question.questionId} className="question-item">
                      <input
                        className="question-item-input"
                        type="checkbox"
                        checked={selectedBankQuestions.some(
                          (q) => q.questionId === question.questionId
                        )}
                        onChange={() => {
                          handleQuestionSelect(question);
                        }}
                      />
                      <span>{question.desc}</span>
                    </label>
                  );
                })}
              </div>

              <button onClick={handleAddSelectedQuestions}>
                Add Selected Questions
              </button>
              <button onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        )}
      </div>
      {showInstructionsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Instructions</h2>
            {instructions.length > 0 ? (
              <div className="instructionList">
                <ul className="instructions-list">
                  {instructions.map((instruction, index) => (
                    <li key={index}>
                      {instruction}
                      <button
                        className="exam-preview-deletebtn"
                        onClick={() => handleDeleteInstruction(index)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="no-instructions-message">No instructions added.</p>
            )}
            <button
              className="modal-close-btn"
              onClick={() => setShowInstructionsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateExam;
