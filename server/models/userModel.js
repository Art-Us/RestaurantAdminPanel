import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    registrationDate: {type: Number, default: 0},
    lastLoginDate: {type: Number, default: 0},
    verifyOtp: {type: String, default: ""},
    verifyOtpExpireAt: {type: Number, default: 0},
    isAccountVerified: {type: Boolean, default: false},
    resetOtp: {type: String, default: ""},
    resetOtpExpireAt: {type: Number, default: 0},
    isAdmin: {type: Boolean, default: false},
    newUserOtp: {type: String, default: ""},
    newUserOtpExpireAt: {type: Number, default: 0},
    wrongOtpAttempts: {type: Number, default: 0}, // <-- добавлено
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;