require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRouter = require('./routers/userRouter');
const inquiryRouter = require('./routers/InquiryRouter');
const adminRouter = require('./routers/adminRouter');
// const aiRouter = require('./routers/aiRouter'); // uncomment when you have a real AI router

const app = express();

// --- CORS ---
const corsOptions = {
    origin: [
        "http://localhost:5173",
        "https://crystalices.site",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-login-time"],
    exposedHeaders: ["Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// --- ROUTES ---
app.get('/', (req, res) => {
    res.status(200).send("🚀 Crystal Backend is Live on Render!");
});

app.use('/api/users', userRouter);       // register, login, profile, subscribers, applications
app.use('/api/inquiry', inquiryRouter);  // submit, all, update-status, stats
app.use('/api/admin', adminRouter);      // stats, equipment/*, staff/*

// app.use('/api/ai', aiRouter);         // uncomment when ready

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error("❌ GLOBAL ERROR:", err.stack);
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});