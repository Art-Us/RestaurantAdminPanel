import promoModel from "../models/promoModel.js";
import userModel from "../models/userModel.js";


export const validatePromoCode = async (req, res) => {
    try {
        const { promoCode } = req.body;

        if (!promoCode) {
            return res.json({ success: false, message: "Promo code is required" });
        }

        const code = await promoModel.findOne({ promoCode });

        if (!code) {
            return res.json({ success: false, message: "Promo code not found" });
        }

        if (code.promoCodeExpireAt < Date.now()) {
            return res.json({ success: false, message: "Promo code expired" });
        }

        res.json({ success: true, message: "Promo code successfully applied" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


export const getAllPromoCodes = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (!user.isAdmin) {
            return res.json({ success: false, message: "Access denied" });
        }

        const promoCodes = await promoModel.find({});
        // if (promoCodes.length === 0) {
        //     return res.json({ success: false, message: "No promo codes in DB" });
        // }

        res.json({
            success: true,
            promoCodes: promoCodes.map(promoCode => ({
                id: promoCode._id,
                promoCode: promoCode.promoCode,
                promoCodeExpireAt: promoCode.promoCodeExpireAt,
                promoCodeCreatedAt: promoCode.promoCodeCreatedAt
            }))
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


export const createPromoCode = async (req, res) => {
    try {
        const userId = req.userId;
        const { promoCode, promoCodeExpireAt } = req.body;

        if (!userId) {
            return res.json({ success: false, message: "Missing userId" });
        }

        if (!promoCode || !promoCodeExpireAt) {
            return res.json({ success: false, message: "Missing promo code or expiration date" });
        }

        const admin = await userModel.findById(userId);
        if (!admin) {
            return res.json({ success: false, message: "Admin not found" });
        }

        if (!admin.isAdmin) {
            return res.json({ success: false, message: "Access denied. Admin only." });
        }

        const isValid = /^[a-zA-Z0-9]+$/.test(promoCode);
        if (!isValid) {
            return res.json({
                success: false,
                message: "Promo code can only contain Latin letters and numbers.",
            });
        }

        if (promoCodeExpireAt < Date.now()) {
            return res.json({ success: false, message: "Yoy can't add expired code" });
        }

        const promoInDb = await promoModel.findOne({ promoCode });
        if (promoInDb) {
            if (promoInDb.promoCodeExpireAt < Date.now()) {
                try {
                    await promoModel.findByIdAndDelete(promoInDb._id);
                } catch (error) {
                    return res.json({ success: false, message: error.message });
                }
            } else {
                return res.json({ success: false, message: "This promo code already exists" });
            }
        }

        const expireDate = new Date(promoCodeExpireAt);
        const code = new promoModel({
            promoCode,
            promoCodeExpireAt: expireDate,
            promoCodeCreatedAt: new Date()
        });

        await code.save();

        return res.json({
            success: true,
            message: `Promo "${promoCode}" has been created, and expires on ${expireDate.toLocaleDateString()}.`
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


export const deletePromoCodeById = async (req, res) => {
    try {
        const userId = req.userId;
        const { promoId } = req.body;

        if (!userId || !promoId) {
            return res.json({ success: false, message: "Missing userId or promoId" });
        }

        const admin = await userModel.findById(userId);
        if (!admin) {
            return res.json({ success: false, message: "Admin not found" });
        }

        if (!admin.isAdmin) {
            return res.json({ success: false, message: "Access denied. Admin only." });
        }

        const code = await promoModel.findById(promoId);
        if (!code) {
            return res.json({ success: false, message: "Promo code not found" });
        }

        const codeText = code.promoCode;
        await promoModel.findByIdAndDelete(promoId);

        return res.json({
            success: true,
            message: `Promo code "${codeText}" has been deleted.`
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
