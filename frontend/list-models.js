require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Please set GEMINI_API_KEY in .env.local");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        console.log("Available models:");
        data.models.forEach(m => {
            if (m.supportedGenerationMethods.includes("generateContent")) {
                console.log("- " + m.name);
            }
        });
    } catch (e) {
        console.error(e);
    }
}
run();