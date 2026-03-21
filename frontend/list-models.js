const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const genAI = new GoogleGenerativeAI("AIzaSyC9os7JwXpyRvCkOgGiaDqkP353zouPrz0");
    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyC9os7JwXpyRvCkOgGiaDqkP353zouPrz0");
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