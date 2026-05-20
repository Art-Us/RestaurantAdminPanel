import userModel from "../models/userModel.js";


export const getUserData = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }
        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
                isAdmin: user.isAdmin
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        
        if (!user){
            return res.json({ success: false, message: "User not found" });
        }
        if (user.isAdmin !== true) {
            return res.json({ success: false, message: "Access denied" });
        }
        const users = await userModel.find({}).select('-password');

        res.json({
            success: true,
            users: users.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isAccountVerified: user.isAccountVerified,
                registrationDate: user.registrationDate,
                lastLoginDate: user.lastLoginDate
            }))
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const deleteUserById = async (req, res) => {
    try {
        const userId = req.userId;
        const {deletedUserId} = req.body;

        if (!userId) {
            return res.json({ success: false, message: "Missing adminId" });
        }
        if (!deletedUserId) {
            return res.json({ success: false, message: "Missing userId" });
        }

        const admin = await userModel.findById(userId);
        if (!admin || !admin.isAdmin) {
            return res.json({ success: false, message: "Access denied. Admin only." });
        }

        const user = await userModel.findById(deletedUserId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.isAdmin) {
            return res.json({ success: false, message: "You can't delete admin" });
        }
        const deletedUserName = user.name;
        await userModel.findByIdAndDelete(deletedUserId);

        return res.json({
            success: true,
            message: `User "${deletedUserName}" (${deletedUserId}) has been deleted.`,
        });

    } catch (error) {
        // console.error("Delete user error:", error);
        return res.json({ success: false, message: error.message });
    }
};