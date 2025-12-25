const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { sendVerification } = require("../utils/emailVerification");
const generateToken = require("../utils/generateToken");

// --- REGISTRATION ---
exports.registerUser = async (req, res) => {
    const { name, email, password, confirmpassword } = req.body;
    try {
        // 1. Validation
        if (!name || !email || !password || !confirmpassword) {
            return res.status(400).json({ success: false, message: "Missing required fields!" });
        }
        if (password !== confirmpassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match!" });
        }

        // 2. Check Existence
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already exists!" });
        }

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 4. Create User in Database
        const newUser = await prisma.user.create({
            data: { 
                name, 
                email, 
                password: hashedPassword, 
                role: "CLIENT", 
                isVerified: false 
            }
        });

        // 5. Attempt to send Email (SILENT FAIL)
        try {
            const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });
            const verificationLink = `https://crystal-ices.vercel.app/verifyemail/${token}`;
            await sendVerification(newUser.email, verificationLink);
        } catch (mailError) {
            // Logs to Render dashboard so you can debug, but user doesn't see a 500 error
            console.error("Registration Email Timeout/Error:", mailError.message);
        }

        return res.status(201).json({
            success: true,
            message: "Registration successful! Please check your email to verify your account.",
            data: { id: newUser.id, name: newUser.name }
        });

    } catch (error) {
        console.error("Global Registration Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// --- LOGIN ---
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        // Handle Unverified Accounts
        if (!user.isVerified) {
            try {
                const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });
                const link = `https://crystal-ices.vercel.app/verifyemail/${token}`;
                await sendVerification(user.email, link);
            } catch (mailError) {
                console.error("Login-trigger Email Error:", mailError.message);
            }
            return res.status(403).json({ 
                success: false, 
                message: "Account not verified. A new verification link has been sent to your email." 
            });
        }

        const token = generateToken(user);
        res.status(200).json({
            success: true,
            token,
            user: { id: user.id, name: user.name, role: user.role, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error during login" });
    }
};

// --- RESEND VERIFICATION ---
exports.resendVerification = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });

        // Security: Don't tell hackers if an email exists or not
        if (!user) {
            return res.status(200).json({ success: true, message: "If an account exists, a link has been sent." });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: "Account is already verified." });
        }

        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });
        const link = `https://crystal-ices.vercel.app/verifyemail/${token}`;

        try {
            await sendVerification(user.email, link);
        } catch (mailError) {
            console.error("Manual Resend Timeout:", mailError.message);
        }

        return res.status(200).json({ 
            success: true, 
            message: "A new verification link has been sent to your inbox." 
        });
    } catch (error) {
        res.status(200).json({ success: true, message: "Request received. Check your email shortly." });
    }
};

// --- EMAIL VERIFICATION ---
exports.verifyEmail = async (req, res) => {
    const token = req.body.token || req.params.token || req.query.token;
    try {
        if (!token) return res.status(400).json({ success: false, message: "Token is required!" });
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        await prisma.user.update({
            where: { email: decoded.email },
            data: { isVerified: true }
        });
        
        return res.status(200).json({ success: true, message: "Email verified successfully!" });
    } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }
};

// --- GET ALL USERS (ADMIN) ---
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { role: "CLIENT" },
            select: { id: true, name: true, email: true, role: true, isVerified: true }
        });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching users" });
    }
};

// --- DELETE USER ---
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({
            where: { id: id } 
        });
        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Delete failed. User may not exist." });
    }
};

// --- UPDATE ROLE ---
exports.updateRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: { role: role },
        });
        return res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// --- UPDATE PROFILE ---
exports.updateProfile = async (req, res) => {
    const { id } = req.params;
    const { name, email, newPass } = req.body;
    try {
        const updateData = { name, email };
        if (newPass && newPass.trim() !== "") {
            const salt = await bcrypt.genSalt(12);
            updateData.password = await bcrypt.hash(newPass, salt);
        }

        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: updateData,
            select: { id: true, name: true, email: true, role: true }
        });

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Update failed" });
    }
};