const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- PUT IT HERE (Top level, after imports) ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Use it here to get the specific model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are the Crystal Industrial Assistant in Lagos..." 
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    
    res.json({ success: true, reply: response.text() });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;