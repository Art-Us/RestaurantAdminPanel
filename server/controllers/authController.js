import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplate.js";

    
export const register = async (req, res) => {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
        return res.json({ success: false, message: "Missing details or OTP" });
    }

    try {
        const adminUser = await userModel.findOne({ isAdmin: true });
        const existingUser = await userModel.findOne({ email });


        if (existingUser) {
            return res.json({ success: false, message: `User ${email} already exists` });
        }

        if (!adminUser) {
            return res.json({ success: false, message: "Admin user not found" });
        }

        if (adminUser.newUserOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP expired" });
        }

        if (adminUser.newUserOtp !== String(otp)) {
            adminUser.wrongOtpAttempts = (adminUser.wrongOtpAttempts || 0) + 1;
            await adminUser.save();

            if (adminUser.wrongOtpAttempts >= 3) {

                adminUser.newUserOtp = "";
                adminUser.newUserOtpExpireAt = 0;
                adminUser.wrongOtpAttempts = 0;
                await adminUser.save();
                return res.json({ success: false, message: "Too many incorrect attempts. Start over." });
            }

            return res.json({ success: false, message: `Invalid OTP. Attempt ${adminUser.wrongOtpAttempts}/3` });
        }


        adminUser.wrongOtpAttempts = 0;
        adminUser.newUserOtp = "";
        adminUser.newUserOtpExpireAt = 0;
        await adminUser.save();

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashedPassword });
        user.registrationDate = Date.now();
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome",
            text: `Welcome! Your account has been created with email: ${email}`
        });

        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: adminUser.email,
            subject: "New user created",
            text: `A new user has been created with email: ${email}`
        });

        return res.json({ success: true, message: "User registered successfully" });

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password){
        return res.json({ success: false, message: "Email and password are reqired" })
    }

    try {
        
        const user = await userModel.findOne({email})

        if (!user){
            return res.json({ success: false, message: "Invalid email" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch){
            return res.json({ success: false, message: "Invalid password" })
        }

        user.lastLoginDate = Date.now();
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'}); //1m
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 //7 days in ms
            // maxAge: 60 * 1000 //7 days in ms
        })

        return res.json({success: true});


    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        })

        return res.json({success: true, message: "Logged Out"});

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const sendVerifyOtp = async (req, res) => {
    try {
        // const {userId} = req.body;
        const userId = req.userId;


        const user = await userModel.findById(userId);

        if (user.isAccountVerified){
            return res.json({ success: false, message: "Account already verified" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now()+24*60*60*1000;
        // user.verifyOtpExpireAt = Date.now()+1*60*1000; // 1min

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account Verification",
            // text: `Yout verification number is ${otp}. Verify your account using it!`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "Yout verification number sent to your email" })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const verifyEmail = async (req, res) => {
    const userId = req.userId;
    const {otp} = req.body;

    if(!userId || !otp){
        return res.json({ success: false, message: "Missing Details" });
    }

    try {
        
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({ success: false, message: "User not found" })
        }

        if (user.verifyOtpExpireAt < Date.now()){
            return res.json({ success: false, message: "Otp expired" })
        }

        if (user.verifyOtp !== String(otp)) {
            user.wrongOtpAttempts = (user.wrongOtpAttempts || 0) + 1;
            await user.save();

            if (user.wrongOtpAttempts >= 3) {

                user.verifyOtp = "";
                user.verifyOtpExpireAt = 0;
                user.wrongOtpAttempts = 0;
                await user.save();
                return res.json({ success: false, message: "Too many incorrect attempts. Start over." });
            }

            return res.json({ success: false, message: `Invalid OTP. Attempt ${user.wrongOtpAttempts}/3` });
        }


        user.verifyOtp = "";
        user.wrongOtpAttempts = 0;
        user.verifyOtpExpireAt = 0;
        user.isAccountVerified = true;

        await user.save();
        return res.json({ success: true, message: "Email verified successfully" })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true})
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
} 

export const sendResetOtp = async (req, res)=> {
    const {email} = req.body;
    if (!email){
        return res.json({ success: false, message: "Email is reqired" })
    }
    try {
        
        const user = await userModel.findOne({email});
        if (!user){
            return res.json({ success: false, message: "User not found" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now()+15*60*1000; // 15min

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password Reset",
            // text: `Your reset number is ${otp}. Use it to reset your password!`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "Yout reset number sent to your email" })


    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const sendNewUserOtp = async (req, res)=> {

    try {
        const adminUser = await userModel.findOne({ isAdmin: true });
        
        
        if (!adminUser){
            return res.json({ success: false, message: "No admins in db" })
        }

        const email = adminUser.email;
        if (!email){
            return res.json({ success: false, message: "Email not found" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        adminUser.newUserOtp = otp;
        adminUser.newUserOtpExpireAt = Date.now()+15*60*1000; // 15min

        await adminUser.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "New User",
            text: `Your new user Otp is ${otp}. Use it to accept new user!`,
            // html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "Your new user number sent to your email" })


    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


export const verifyNewUserOtp = async (req, res) => {
    const {otp} = req.body;

    if(!otp){
        console.log(otp);
        
        return res.json({ success: false, message: "Missing otp" });
    }

    try {
        
        const adminUser = await userModel.findOne({ isAdmin: true });

        if(!adminUser){
            return res.json({ success: false, message: "Admin not found" })
        }

        if(adminUser.newUserOtp === '' || adminUser.newUserOtp !== String(otp)){
            return res.json({ success: false, message: "Invalid otp" })
        }

        if (adminUser.newUserOtpExpireAt < Date.now()){
            return res.json({ success: false, message: "Otp expired" })
        }
        // adminUser.newUserOtp="";
        // adminUser.newUserOtpExpireAt = 0;
        // await adminUser.save();

        return res.json({ success: true, message: "Otp is OK" })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}






export const verifyOtp = async (req, res) => {
    // const email = req.body;
    const {email, otp} = req.body;

    if(!email || !otp){
        console.log(email);
        console.log(otp);
        
        return res.json({ success: false, message: "Missing Details" });
    }

    try {
        
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({ success: false, message: "User not found" })
        }

        if (user.resetOtpExpireAt < Date.now()){
            return res.json({ success: false, message: "Otp expired" })
        }


        if (user.resetOtp !== String(otp)) {
            user.wrongOtpAttempts = (user.wrongOtpAttempts || 0) + 1;
            await user.save();

            if (user.wrongOtpAttempts >= 3) {

                user.resetOtp = "";
                user.resetOtpExpireAt = 0;
                user.wrongOtpAttempts = 0;
                await user.save();
                return res.json({ success: false, message: "Too many incorrect attempts. Start over." });
            }

            return res.json({ success: false, message: `Invalid OTP. Attempt ${user.wrongOtpAttempts}/3` });
        }


        user.wrongOtpAttempts = 0;
        user.save();


        return res.json({ success: true, message: "Otp is OK" })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}










export const resetPassword = async (req, res)=>{
    const {email, otp, newPassword} = req.body;

    if (!email || !otp || !newPassword){
        return res.json({success: false, message: "Email, Otp and new password are required!" })
    }

    try {
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({success: false, message: "User not found" })
        }
        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({success: false, message: "Invalid otp" })
        }
        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success: false, message: "Otp Expired" })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp="";
        user.resetOtpExpireAt = 0;
        await user.save();

        return res.json({success: true, message: "Password has been reset successfully" })
    } catch (error) {
        res.json({success: false, message: email.message })
    }
}