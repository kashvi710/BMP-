import Exam from "../models/exam.js";
import Question from "../models/question.js";
import User from "../models/user.js";

export const create_exam = async (req, res) => {
    try {
        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Examiner Found" });
        }

        const examiner = await User.findOne({ username });

        if (!examiner) {
            return res.status(404).json({ message: "No Examiner Found" });
        }

        const {
            questions,
            startTime,
            duration,
            title,
            semester,
            examType,
            batch,
            branch,
            total_points,
            status,
            instructions,
            subject,
        } = req.body;

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "Questions are required" });
        }

        if (
            !startTime ||
            !duration ||
            !title ||
            !semester ||
            !examType ||
            !batch ||
            !branch ||
            !total_points ||
            !status ||
            !subject
        ) {
            return res
                .status(400)
                .json({
                    message: "Missing required fields for creating an exam",
                });
        }

        if (startTime) {
            const starttime = new Date(startTime);
            const currenttime = new Date();

            if (currenttime >= starttime) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Start time must be greater than the current time",
                    });
            }
        } else if (status === "Published") {
            return res
                .status(400)
                .json({ message: "Can't publish exam without starting time" });
        }

        const getQuestionIds = async () => {
            let questionIds = [];
            for (const question of questions) {
                if (question?.questionId) {
                    questionIds.push(question.questionId);

                    const newQuestion = await Question.findOne({
                        questionId: question.questionId,
                    });
                    if (!newQuestion) {
                        return res
                            .status(400)
                            .json({ message: "Question not found" });
                    }

                    if (newQuestion.subject !== subject) {
                        return res
                            .status(401)
                            .json({ message: "Subject not match" });
                    }
                } else {
                    if (
                        !question.desc ||
                        !question.options ||
                        question.points == null ||
                        !question.difficulty ||
                        question.answer == null
                    ) {
                        return res
                            .status(400)
                            .json({ message: "Missing required fields for creating a question" });
                    }

                    const newQuestion = new Question({
                        desc: question.desc,
                        options: question.options,
                        creatorUsername: username,
                        points: question.points,
                        creator: `${examiner.firstname} ${examiner.lastname}`,
                        difficulty: question.difficulty,
                        answer: question.answer,
                        subject: subject,
                    });

                    const newQuestionsaved = await newQuestion.save();
                    questionIds.push(newQuestionsaved.questionId);
                }
            }
            return questionIds;
        };

        let questionIds = [];
        try {
            questionIds = await getQuestionIds();
        } catch (err) {
            console.log(err);
            return res
                .status(400)
                .json({ message: `Error creating questions: ${err.message}` });
        }

        const exam = new Exam({
            creator: `${examiner.firstname} ${examiner.lastname}`,
            creatorUsername: username,
            questions: questionIds,
            startTime,
            duration,
            title,
            semester,
            examType,
            batch,
            branch,
            total_points,
            status,
            instructions,
            subject,
        });

        await exam.save();
        return res
            .status(200)
            .json({ message: "Exam created successfully.", exam });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

// Update an existing exam by its ID
export const update_exam = async (req, res) => {
    try {
        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Examiner Found" });
        }

        const examiner = await User.findOne({ username });

        if (!examiner) {
            return res.status(404).json({ message: "No Student Found" });
        }

        const { examId } = req.params;
        const {
            questions,
            startTime,
            duration,
            title,
            semester,
            examType,
            batch,
            branch,
            total_points,
            status,
            instructions,
            subject,
        } = req.body;

        // Find the exam by examId and update it
        const examData = await Exam.findOne({ examId: examId });

        if (!examData) {
            return res.status(404).json({ message: "Exam not found." });
        }

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "Questions are required" });
        }

        if (
            !startTime ||
            !duration ||
            !title ||
            !semester ||
            !examType ||
            !batch ||
            !branch ||
            !total_points ||
            !status ||
            !subject
        ) {
            return res
                .status(400)
                .json({
                    message: "Missing required fields for creating an exam",
                });
        }

        if (startTime) {
            const starttime = new Date(startTime);
            const currenttime = new Date();

            if (currenttime >= starttime) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Start time must be greater than the current time",
                    });
            }
        } else if (status === "Published") {
            return res
                .status(400)
                .json({ message: "Can't publish exam without starting time" });
        }

        const getQuestionIds = async () => {
            let questionIds = [];
            for (const question of questions) {
                if (question?.questionId) {
                    const newQuestion = await Question.findOneAndUpdate(
                        { questionId: question.questionId },
                        question,
                        { new: true }
                    );

                    questionIds.push(newQuestion.questionId);

                    if (!newQuestion) {
                        return res
                            .status(400)
                            .json({ message: "Question not found" });
                    }

                    if (newQuestion.subject !== subject) {
                        return res
                            .status(401)
                            .json({ message: "Subject not match" });
                    }
                } else {
                    if (
                        !question.desc ||
                        !question.options ||
                        question.points == null ||
                        !question.difficulty ||
                        question.answer == null
                    ) {
                        return res
                            .status(400)
                            .json({ message: "Missing required fields for creating a question" });
                    }

                    const newQuestion = new Question({
                        desc: question.desc,
                        options: question.options,
                        creatorUsername: username,
                        points: question.points,
                        creator: `${examiner.firstname} ${examiner.lastname}`,
                        difficulty: question.difficulty,
                        answer: question.answer,
                        subject: subject,
                    });

                    const newQuestionsaved = await newQuestion.save();
                    questionIds.push(newQuestionsaved.questionId);
                }
            }
            return questionIds;
        };

        let questionIds = [];
        try {
            questionIds = await getQuestionIds();
        } catch (err) {
            console.log(err);
            return res
                .status(400)
                .json({ message: `Error creating questions: ${err.message}` });
        }

        const exam = await Exam.findOneAndUpdate(
            { examId },
            {
                creator: `${examiner.firstname} ${examiner.lastname}`,
                creatorUsername: username,
                questions: questionIds,
                startTime,
                duration,
                title,
                semester,
                examType,
                batch,
                branch,
                total_points,
                status,
                instructions,
                subject,
            }
        );
        return res
            .status(200)
            .json({ message: "Exam updated successfully.", exam });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

// Delete an exam by its ID
export const delete_exam = async (req, res) => {
    try {
        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Examiner Found" });
        }

        const { examId } = req.params;

        // Find the exam by ID and delete it
        const exam = await Exam.findOne({ examId });

        if(!exam){
            return res.status(404).json({ message: "Exam not found"});
        }

        if (exam.creatorUsername !== username) {
            return res
                .status(401)
                .json({ message: "You have no access to delete this exam" });
        }

        const startTime = new Date(exam.startTime);
        const currentTime = new Date();

        if (currentTime > startTime) {
            return res
                .status(401)
                .json({
                    message:
                        "Exam Can not be deleted because it is already taken",
                });
        }

        if (!exam) {
            return res.status(404).json({ message: "Exam not found." });
        }

        // Delete the exam
        await exam.deleteOne();

        return res.status(200).json({ message: "Exam deleted successfully." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

// Add a question to an exam
export const add_question_in_exam = async (req, res) => {
    try {
        const { examId } = req.params; 
        const { questionId } = req.body; 
        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Examiner Found" });
        }

        // Find the exam and update by pushing the new question to the questions array
        const exam = await Exam.findOne({ examId: examId });

        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        if (exam.creatorUsername !== username) {
            return res
                .status(401)
                .json({ message: "Can't add question to someone else's exam" });
        }

        const startTime = new Date(exam.startTime);
        const currentTime = new Date();

        if (currentTime > startTime) {
            return res
                .status(401)
                .json({
                    message:
                        "Exam Can not be edited because it is already started/ended.",
                });
        }

        const question = await Question.findOne({ questionId });

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }
        // Add the question to the exam's questions array
        if (!exam.questions.includes(questionId)) {
            exam.questions.push(questionId);
            exam.total_points += question.points;
            await exam.save();
        }

        return res
            .status(200)
            .json({ message: "Question added to exam successfully", exam });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: error.message });
    }
};

// Remove a question from an exam
export const delete_question_from_exam = async (req, res) => {
    try {
        const { examId, questionId } = req.params;
        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Examiner Found" });
        }

        // Find the exam by ID
        const exam = await Exam.findOne({ examId: examId });

        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        if (exam.creatorUsername !== username) {
            return res
                .status(401)
                .json({
                    message: "Can't delete question to someone else's exam",
                });
        }

        const question = await Question.findOne({ questionId });

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Remove the question from the exam's questions array
        const questionIndex = exam.questions.indexOf(questionId);
        if (questionIndex !== -1) {
            exam.questions.splice(questionIndex, 1);
            exam.total_points -= question.points;
            await exam.save();
        }

        return res
            .status(200)
            .json({ message: "Question removed from exam successfully", exam });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: error.message });
    }
};

export const fetch_exam_student = async (req, res) => {
    try {
        const { examId } = req.params;

        // Find the exam by ID without fetching questions
        const exam = await Exam.findOne({ examId }).lean();

        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        // Fetch all questions using their unique IDs
        const questions = await Question.find({
            questionId: { $in: exam.questions },
        }).select("-answer");

        return res.status(200).json({
            message: "Exam Fetched Successfully",
            exam: { ...exam, questions },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

export const fetch_exam_examiner = async (req, res) => {
    try {
        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Examiner Found" });
        }

        const { examId } = req.params;

        // Find the exam by ID without fetching questions
        const exam = await Exam.findOne({ examId }).lean();
        
        if (!exam || exam.creatorUsername !== username) {
            return res.status(404).json({ message: "Exam not found." });
        }

        // Fetch all questions using their unique IDs
        const questions = await Question.find({
            questionId: { $in: exam.questions },
        });

        return res.status(200).json({
            message: "Exam Fetched Successfully",
            exam: { ...exam, questions },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};
