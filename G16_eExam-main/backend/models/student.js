import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },

    batch: {
        type: Number,
        required: true
    },

    branch: {
        type: String,
        enum : ['ICT', 'CS', 'MnC', 'EVD'],
        required: true
    },

    graduation: {
        type: String,
        enum : ['UG' , 'PG'],
        required: true
    },

    bookmarkedQuestions: [{
        type: Number
    }],

    givenExams: [
        {
            exam: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Exam",
                required: true,
            },
            questions: [
                {
                    question: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Question",
                        required: true,
                    },

                    answer: { // 0 for first option and so on..
                        type: Number,
                        required: true,
                    },
                },
            ],
            obtained_score: {
                type: Number,
                default: 0
            },
            submitted: {
                type: Boolean,
                default: false
            }
        },
    ],
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
