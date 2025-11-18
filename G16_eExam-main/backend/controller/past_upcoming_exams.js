import Exam from "../models/exam.js";
import Student from "../models/student.js";
import Examiner from "../models/examiner.js";
import User from "../models/user.js";
import Question from "../models/question.js";

export const get_past_exams = async (req, res) => {
    try {
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
        });

        return res
            .status(200)
            .json({ message: "Past exams retrieved successfully.", pastExams });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: error.message });
    }
};


export const get_upcoming_exams = async (req, res) => {
    try {
        const currentTime = new Date();

        // Fetch exams with a startTime in the future  (startTime > currentTime)
        const upcomingExams = await Exam.find({
            $expr: {
                $gt: [
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
        }).select("-questions");

        return res
            .status(200)
            .json({
                message: "Upcoming exams retrieved successfully.",
                upcomingExams,
            });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: error.message });
    }
};


export const get_upcoming_exams_5_student = async (req, res) => {
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

        // Fetch only 5 exams with a startTime in the future (startTime > currentTime)
        const upcomingExams = await Exam.find({
            $expr: {
                $gt: [
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
        })
            .sort({ startTime: 1 }) // Sort by startTime in ascending order
            .limit(5)
            .select("-questions"); // Limit to 5 results

        return res
            .status(200)
            .json({
                message: "Upcoming exams retrieved successfully.",
                upcomingExams,
            });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: error.message });
    }
};

export const get_past_exams_5_student = async (req, res) => {
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
        const currentYear = currentTime.getFullYear();

        // Fetch exams that have ended and are within the current year
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
        })
            .sort({ startTime: -1 })
            .limit(5); // Sort by startTime in descending order

        return res
            .status(200)
            .json({ message: "Past exams retrieved successfully.", pastExams });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: error.message });
    }
};

export const get_upcoming_exams_student = async (req, res) => {
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

        // Fetch exams with a startTime in the future  (startTime > currentTime)
        const upcomingExams = await Exam.find({
            $expr: {
                $gt: [
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
        }).select("-questions");

        upcomingExams.sort((a, b) => {
            const dateA = new Date(a.startTime);
            const dateB = new Date(b.startTime);
            return dateA - dateB; // Ascending order
        });

        return res
            .status(200)
            .json({
                message: "Upcoming exams retrieved successfully.",
                upcomingExams,
            });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: error.message });
    }
};

export const get_upcoming_exams_5_examiner = async (req, res) => {
    try {
        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Username Found" });
        }

        const examiner = await Examiner.findOne({ username });

        if (!examiner) {
            return res.status(404).json({ message: "No examiner Found" });
        }

        const currentTime = new Date();

        // Fetch only 5 exams with a startTime in the future (startTime > currentTime)
        const upcomingExams = await Exam.find({
            $expr: {
                $gt: [
                    "$startTime",
                    currentTime,
                ],
            },
            status: "Published",
        })
            .sort({ startTime: 1 }) // Sort by startTime in ascending order
            .limit(5)
            .select("-questions"); // Limit to 5 results

        return res
            .status(200)
            .json({
                message: "Upcoming exams retrieved successfully.",
                upcomingExams,
            });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: error.message });
    }
};

export const get_past_exams_5_examiner = async (req, res) => {
    try {
        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Username Found" });
        }

        const examiner = await Examiner.findOne({ username });

        if (!examiner) {
            return res.status(404).json({ message: "No examiner Found" });
        }

        const currentTime = new Date();

        // Fetch exams that have ended and are within the current year
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
        })
            .sort({ startTime: -1 })
            .limit(5); // Sort by startTime in descending order

        return res
            .status(200)
            .json({ message: "Past exams retrieved successfully.", pastExams });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: error.message });
    }
};

export const get_upcoming_exams_examiner = async (req, res) => {
    try {
        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Username Found" });
        }

        const examiner = await User.findOne({ username });

        if (!examiner) {
            return res.status(404).json({ message: "No Examiner Found" });
        }

        const currentTime = new Date();

        // Fetch exams with a startTime in the future  (startTime > currentTime)
        const upcomingExams = await Exam.find({
            $expr: {
                $gt: [
                    "$startTime",
                    currentTime,
                ],
            },
            creatorUsername: username
        }).sort({ startTime: -1 }).lean();

        const upcomingExamsQuestions = await Promise.all(
            upcomingExams.map(async (exam) => {
                // Fetch the questions for this exam
                const questions = await Question.find({ questionId: { $in: exam.questions } }).lean();

                return {
                    ...exam,
                    questions, // Attach full question details
                };
            })
        );

        return res
            .status(200)
            .json({
                message: "Upcoming exams retrieved successfully.",
                upcomingExams:upcomingExamsQuestions,
            });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: error.message });
    }
};

export const get_past_exams_examiner = async (req, res) => {
    try {
        const username = req?.user?.username;

        if (!username) {
            return res.status(404).json({ message: "No Username Found" });
        }

        const examiner = await User.findOne({ username });

        if (!examiner) {
            return res.status(404).json({ message: "No Examiner Found" });
        }

        const currentTime = new Date();

        // Fetch exams with a startTime in the future  (startTime > currentTime)
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
            creatorUsername: username
        }).sort({ startTime: -1 }).lean();

        const pastExamsQuestions = await Promise.all(
            pastExams.map(async (exam) => {
                // Fetch the questions for this exam
                const questions = await Question.find({ questionId: { $in: exam.questions } }).lean();

                return {
                    ...exam,
                    questions, // Attach full question details
                };
            })
        );

        return res
            .status(200)
            .json({
                message: "Past exams retrieved successfully.",
                pastExams:pastExamsQuestions,
            });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: error.message });
    }
};