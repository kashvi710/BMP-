import Question from "../models/question.js";
import Student from "../models/student.js";
import Exam from "../models/exam.js";
import User from "../models/user.js"

// Create a new question
export const create_question = async (req, res) => {
    try {

        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Examiner Found" });
        }

        const { desc, options, points, difficulty, answer, subject } =
            req.body;

        if (!options || options.length < 2) {
            return res
                .status(400)
                .json({ message: "At least two options are required." });
        }

        const examiner = await User.findOne({ username });

        if (!examiner) {
            return res.status(404).json({ message: "No Student Found" });
        }

        // Create a new question
        const question = new Question({
            desc,
            options,
            creatorUsername:username,
            points,
            creator:`${examiner.firstname} ${examiner.lastname}`,
            difficulty,
            answer,
            subject,
        });

        // Save the question to the database
        await question.save();

        return res
            .status(200)
            .json({ message: "Question created successfully.", question });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

// Update a question by its ID
export const update_question = async (req, res) => {
    try {

        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Examiner Found" });
        }

        const { id } = req.params; // ID of the question to update
        const { desc, options, points, difficulty, answer, subject } =
            req.body;

        const examiner = await User.findOne({ username });

        if (!examiner) {
            return res.status(404).json({ message: "No Student Found" });
        }

        if (options && options.length < 2) {
            return res
                .status(400)
                .json({ message: "At least two options are required." });
        }

        // Find the question by ID
        const question = await Question.findOne({ questionId: id });

        // If the question is not found, return a 404 error
        if (!question || question.creatorUsername !== username) {
            return res.status(404).json({ message: "Question not found." });
        }

        // Update the fields of the question
        question.desc = desc || question.desc;
        question.options = options || question.options;
        question.points = points || question.points;
        question.difficulty = difficulty || question.difficulty;
        question.answer = answer || question.answer;
        question.subject = subject || question.subject;

        // Save the updated question
        await question.save();

        return res
            .status(200)
            .json({ message: "Question updated successfully.", question });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

// Delete a question by its ID
export const delete_question = async (req, res) => {
    try {

        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Examiner Found" });
        }

        const examiner = await User.findOne({ username });

        if (!examiner) {
            return res.status(404).json({ message: "No Student Found" });
        }

        const { id } = req.params; // ID of the question to delete

        // Find the question by ID and delete it
        const question = await Question.findOne({ questionId: id }); // Use findOne with _id filter

        if (!question || question.creatorUsername !== username) {
            return res.status(404).json({ message: "Question not found." });
        }

        // Delete the question
        await question.deleteOne(); // deleteOne() removes the document

        return res
            .status(200)
            .json({ message: "Question deleted successfully." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

// get all questions subject wise - only those whose exam are past exams - only current student batch
export const all_questions_subject_wise_student = async (req, res) => {
    try {
        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Username Found" });
        }

        const student = await Student.findOne({ username });

        if (!student) {
            return res.status(404).json({ message: "No Student Found" });
        }

        const currentTime = new Date();

        // Fetch exams that have ended (startTime + duration < currentTime)
        const pastExams = await Exam.find({
            $expr: {
                $lt: [
                    {
                        $add: [
                            "$startTime",
                            { $multiply: ["$duration", 60000] },
                        ],
                    },
                    currentTime,
                ],
            },
            status: "Published",
            batch: student.batch,
            branch: student.branch,
        });

        // Extract and flatten questionIds from past exams
        const questionIds = [
            ...new Set(pastExams.flatMap((exam) => exam.questions)),
        ];

        // Fetch and group questions by subject for the unique questionIds
        const groupedQuestions = await Question.aggregate([
            {
                $match: {
                    questionId: { $in: questionIds }, // Filter questions by unique questionIds
                },
            },
            {
                $group: {
                    _id: "$subject", // Group by the subject field
                    questions: { $push: "$$ROOT" }, // Push the entire question document into the array
                },
            },
            {
                $project: {
                    _id: 0, // Remove the _id field from the output
                    subject: "$_id", // Rename _id to subject
                    questions: 1, // Keep the questions array
                },
            },
        ]);

        return res
            .status(200)
            .json({
                message: "Questions retrieved successfully.",
                groupedQuestions,
            });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: error.message });
    }
};

// add question to bookmark
export const add_question_bookmark_student = async (req, res) => {
    try {
        const { questionId } = req.body;

        if (!questionId) {
            return res.status(404).json({ message: "No Question Found" });
        }

        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Username Found" });
        }

        const student = await Student.findOne({ username });

        if (!student) {
            return res.status(404).json({ message: "No Student Found" });
        }

        student.bookmarkedQuestions.push(questionId);

        await student.save();

        return res
            .status(200)
            .json({ message: "Question bookmarked successfully." });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: error.message });
    }
};

// delete question from bookmark
export const delete_question_bookmark_student = async (req, res) => {
    try {
        const { questionId } = req.body;

        if (!questionId) {
            return res.status(404).json({ message: "No Question Found" });
        }

        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Username Found" });
        }

        const student = await Student.findOne({ username });

        if (!student) {
            return res.status(404).json({ message: "No Student Found" });
        }

        const result = await Student.updateOne(
            { _id: student._id }, 
            { $pull: { bookmarkedQuestions: questionId } } 
        );

        if (result.modifiedCount === 0) {
            return res
                .status(404)
                .json({ message: "Question not found or already removed." });
        }

        return res
            .status(200)
            .json({ message: "Question unbookmarked successfully." });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: error.message });
    }
};

// get all questions examiner
export const all_questions_examiner = async (req, res) => {
    try {
        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Examiner Found" });
        }

        const examiner = await User.findOne({ username });

        if (!examiner) {
            return res.status(404).json({ message: "No Student Found" });
        }

        const questions = await Question.find({
            creatorUsername: username
        }).lean();

        return res
            .status(200)
            .json({
                message: "Questions retrieved successfully.",
                questions,
            });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: error.message });
    }
};