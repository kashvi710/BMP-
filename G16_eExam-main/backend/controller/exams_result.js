import Exam from "../models/exam.js";
import Student from "../models/student.js";
import User from "../models/user.js";

export const exams_result = async (req,res) => {
    try {
        const username = req?.user?.username; 

        if (!username) {
            return res.status(404).json({ message: "No username found" });
        }

        const student = await Student.findOne({ username }).populate({
            path: 'givenExams.exam',
            select: 'examId total_points title subject' 
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const results = [];

        for (const examEntry of student.givenExams) {
            const exam = examEntry.exam;

            const percentage = (examEntry.obtained_score / exam.total_points) * 100;

            results.push({
                examId: exam.examId,
                title: exam.title,
                subject: exam.subject,
                totalPoints: exam.total_points,
                obtainedPoints: examEntry.obtained_score,
                percentage
            });
            
        }

        return res.status(200).json({ message: "Results Fetched Successfully", pastExams: results});

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

export const show_exam = async (req,res) => {
    try {

        const { examId, username } = req.params;

        if (!username) {
            return res.status(404).json({ message: "No username found" });
        }

        if (!examId) {
            return res.status(404).json({ message: "No Exam found" });
        }

        const student = await Student.findOne({ username })
            .populate({
                path: 'givenExams.exam',
                match: { examId: parseInt(examId) }, 
                select: 'examId title' 
            })
            .populate({
                path: 'givenExams.questions.question', 
                select: 'questionId desc options answer' 
            });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const exam = student.givenExams.find(exam => exam?.exam?.examId === parseInt(examId));

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found for this student' });
        }

        const questionDetails = [];

        for (const questionEntry of exam.questions) {
            const question = questionEntry.question; 
            const selectedAnswer = questionEntry.answer;  
            const correctAnswer = question.answer;  

            questionDetails.push({
                questionId: question.questionId,
                description: question.desc,
                options: question.options,
                selectedAnswer,
                correctAnswer,
            });
        }

        return res.status(200).json({
            message: "Exam Fetched successfully",
            examId: exam.exam.examId,
            title: exam.exam.title,
            questions: questionDetails
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

export const exam_attempted_student = async (req, res) => {
    try {
        const { examId } = req.params;

        if (!examId) {
            return res.status(400).json({ message: "Exam ID is required" });
        }

        const exam = await Exam.findOne({ examId });

        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        const students = await Student.find({ "givenExams.exam": exam._id }, "username givenExams batch")
            .populate("givenExams.exam");

        if (students.length === 0) {
            return res.status(404).json({ message: "No students have attempted this exam" });
        }

        const results = await Promise.all(students.map(async (student) => {
            const examData = student.givenExams.find((e) => e.exam._id.equals(exam._id));


            const user = await User.findOne({ username: student.username });

            return {
                username: student.username,
                name: `${user.firstname} ${user.lastname}`,
                batch: student.batch,
                obtainedPoints: examData.obtained_score,
                totalPoints: examData.exam.total_points || 0, 
            };
        }));

        // Sort results by obtained points in descending order
        results.sort((a, b) => b.obtainedPoints - a.obtainedPoints);

        return res.status(200).json({ message: "Student Data fetched successfully", results });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

