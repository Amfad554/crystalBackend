require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRouter = require('./routers/userRouter');
const inquiryRouter = require('./routers/InquiryRouter');
const adminRouter = require('./routers/adminRouter');
const aiRouter = require('./routers/adminRouter');

const app = express();

// --- MIDDLEWARES ---
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://crystalices.site",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-login-time"], // ✅ ADDED x-login-time
    credentials: true
}));

app.use(express.json());

// --- ROUTES ---
app.get('/', (req, res) => {
    res.status(200).send("🚀 Crystal Backend is Live on Render!");
});

app.use('/api/users', userRouter);
app.use('/api/inquiry', inquiryRouter);
app.use('/api/admin', adminRouter);
app.use('/api/equipment', adminRouter); // For the Catalogue
app.use('/api/equipment', aiRouter); // For the Catalogue

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error("❌ GLOBAL ERROR:", err.stack);
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

// Render dynamic port binding
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is booming on port ${PORT}`);
});