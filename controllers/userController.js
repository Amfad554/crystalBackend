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
        // 1. Basic Validation
        if (!name || !email || !password || !confirmpassword) {
            return res.status(400).json({ success: false, message: "Missing required fields!" });
        }
        if (password !== confirmpassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match!" });
        }

        // 2. Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already exists!" });
        }

        // 3. Hash Password and Create User
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "CLIENT",
                isVerified: false
            }
        });

        // 4. Generate Token and Send Email
        const token = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });
        const verificationLink = `${process.env.FRONTEND_URL}/verifyemail/${token}`;

        try {
            await sendVerification(newUser.email, verificationLink);
            console.log(`✅ Verification email queued for ${newUser.email}`);
        } catch (mailError) {
            // We still return 201 because the user WAS created, 
            // but we alert the console that the email failed.
            console.error("❌ Mailer failed:", mailError.message);
        }

        return res.status(201).json({
            success: true,
            message: "Registration successful! Please check your email for verification.",
            data: { id: newUser.id, name: newUser.name }
        });

    } catch (error) {
        console.error("🔥 Registration Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// --- LOGIN ---
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });

        // 1. Check Credentials
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        // 2. Handle Unverified Account
        if (!user.isVerified) {
            try {
                // Generate a new temporary token
                const jwt = require("jsonwebtoken");
                const { sendVerification } = require("../utils/emailVerification");

                const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });
                const verificationLink = `${process.env.FRONTEND_URL}/verifyemail/${token}`;

                await sendVerification(user.email, verificationLink);

                return res.status(403).json({
                    success: false,
                    message: "Account not verified. A new verification link has been sent to your email."
                });
            } catch (mailError) {
                return res.status(403).json({
                    success: false,
                    message: "Account not verified. Please contact support."
                });
            }
        }

        // 3. Successful Login
        const token = generateToken(user);
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                email: user.email,
                bio: user.bio || "",
                phone: user.phone || ""
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
};
// --- UPDATE PROFILE ---
exports.updateProfile = async (req, res) => {
    const { id } = req.params;
    const { name, email, bio, phone, password } = req.body;

    try {
        const updateData = {
            name,
            email,
            bio: bio ?? null,
            phone: phone ?? null
        };

        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(12);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                bio: true,
                phone: true
            }
        });

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Profile Update Error:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(500).json({ success: false, message: "Update failed" });
    }
};

// --- VERIFY EMAIL ---
exports.verifyEmail = async (req, res) => {
    const token = req.body.token || req.params.token;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        await prisma.user.update({
            where: { email: decoded.email },
            data: { isVerified: true }
        });
        return res.status(200).json({ success: true, message: "Verified!" });
    } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid token" });
    }
};

// --- GET ALL USERS ---
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, isVerified: true }
        });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching users" });
    }
};

// --- DELETE USER ---
exports.deleteUser = async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Delete failed" });
    }
};

// --- UPDATE ROLE ---
exports.updateRole = async (req, res) => {
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: { role: req.body.role },
        });
        return res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
// --- NEWSLETTER SUBSCRIPTION ---
// --- ADDED: GET ALL NEWSLETTER SUBSCRIBERS ---
// This matches your dashboard's fetch to: api/users/newsletter-all
exports.getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await prisma.newsletter.findMany({
            orderBy: {
                createdAt: 'desc' // Shows newest subscribers first
            }
        });

        res.status(200).json({
            success: true,
            data: subscribers
        });
    } catch (error) {
        console.error("Fetch Subscribers Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch subscribers list"
        });
    }
};

// --- NEWSLETTER SUBSCRIPTION (EXISTING) ---
exports.subscribeNewsletter = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required." });
        }

        const existing = await prisma.newsletter.findUnique({
            where: { email }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: "You are already subscribed!" });
        }

        const subscription = await prisma.newsletter.create({
            data: { email }
        });

        res.status(200).json({
            success: true,
            message: "Successfully joined the newsletter!",
            data: subscription
        });
    } catch (error) {
        console.error("Newsletter Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// --- CAREER APPLICATION ---
exports.applyForJob = async (req, res) => {
    const { name, email, cvLink, roleTitle } = req.body;

    try {
        // You can save this to a new Prisma model called 'Application'
        const application = await prisma.application.create({
            data: {
                applicantName: name,
                applicantEmail: email,
                cvLink: cvLink,
                roleApplied: roleTitle
            }
        });

        res.status(201).json({ success: true, message: "Application received!", data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getAllApplications = async (req, res) => {
    try {
        const apps = await prisma.application.findMany({ orderBy: { createdAt: 'desc' } });
        res.status(200).json({ success: true, data: apps });
    } catch (e) { res.status(500).json({ success: false }); }
};