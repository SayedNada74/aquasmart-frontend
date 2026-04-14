const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const genAI = new GoogleGenerativeAI("AIzaSyC7y1a3LdYiy0u4x-fs8rNsl3KMFUAISbo");
    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyC7y1a3LdYiy0u4x-fs8rNsl3KMFUAISbo");
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