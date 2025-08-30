const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Ongoing", "Complete", "Cancel"],
        default: "Pending",
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Emergency"],
        default: "Medium",
    }
});


const TaskModel = mongoose.model('Task', TaskSchema);
module.exports = TaskModel;