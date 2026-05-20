import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, default: ""},
    phone: {type: String, default: "", required: true},
    comment: {type: String, default: "", required: true},
    rating: {type: Number, default: 0, required: true},
    sentDate: {type: Number, default: Date.now},
    addedDate: { type: Number, default: 0 },
    isApplied: {type: Boolean, default: false},
});

const feedbackModel = mongoose.models.feedback || mongoose.model("feedback", feedbackSchema);

export default feedbackModel;