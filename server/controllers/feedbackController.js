import feedbackModel from "../models/feedbackModel.js";
import userModel from "../models/userModel.js";
import { io } from "../server.js";

export const createFeedBack = async (req, res) => {
    try {
        const { firstName, lastName, phone, comment, rating } = req.body;

        if (!firstName || !phone || !comment || !rating) {
            return res.json({ success: false, message: "Missing details" });
        }

        

        const feedback = new feedbackModel({
            firstName,
            lastName,
            phone,
            comment,
            rating
        });

        await feedback.save();
        io.emit("new-feedback", feedback);

        return res.json({
            success: true,
            message: `Feedback added to db.`
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const getAllFeedBacks = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (!user.isAdmin) {
            return res.json({ success: false, message: "Access denied" });
        }

        const feedbacks = await feedbackModel.find({});

        res.json({
            success: true,
            feedbacks: feedbacks.map(feedback => ({
                id: feedback._id,
                firstName: feedback.firstName,
                lastName: feedback.lastName,
                phone: feedback.phone,
                comment: feedback.comment,
                rating: feedback.rating,
                sentDate: feedback.sentDate,
                addedDate: feedback.addedDate,
                isApplied: feedback.isApplied
            }))
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};



export const applyFeedBackById = async (req, res) => {
    try {
        const userId = req.userId;
        const { feedbackId } = req.body;

        if (!userId || !feedbackId) {
            return res.json({ success: false, message: "Missing userId or feedbackId" });
        }

        const admin = await userModel.findById(userId);
        if (!admin) {
            return res.json({ success: false, message: "Admin not found" });
        }

        if (!admin.isAdmin) {
            return res.json({ success: false, message: "Access denied. Admin only." });
        }

        const feedback = await feedbackModel.findById(feedbackId);
        if (!feedback) {
            return res.json({ success: false, message: "Feedback not found" });
        }

        feedback.isApplied = true;
        feedback.addedDate = Date.now();
        await feedback.save();

        return res.json({
            success: true,
            message: `${feedback.firstName}'s feedbach has been applied.`
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const deleteFeedBackById = async (req, res) => {
    try {
        const userId = req.userId;
        const { feedbackId } = req.body;

        if (!userId || !feedbackId) {
            return res.json({ success: false, message: "Missing userId or promoId" });
        }

        const admin = await userModel.findById(userId);
        if (!admin) {
            return res.json({ success: false, message: "Admin not found" });
        }

        if (!admin.isAdmin) {
            return res.json({ success: false, message: "Access denied. Admin only." });
        }

        const feedback = await feedbackModel.findById(feedbackId);
        if (!feedback) {
            return res.json({ success: false, message: "Promo code not found" });
        }

        const feedbacksAuthor = feedback.firstName;
        await feedbackModel.findByIdAndDelete(feedbackId);

        return res.json({
            success: true,
            message: `${feedbacksAuthor}'s feedback has been deleted.`
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};



