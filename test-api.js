import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("No API Key found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
    try {
        // List available models
        // Note: The SDK might not expose listModels directly on the instance in this version, 
        // but let's try to just use a known stable model or try to fetch models if possible.
        // Actually, for this SDK version, let's try 'gemini-pro' as a fallback test first,
        // or better, let's try to use the model name that definitely exists.

        console.log("Testing with gemini-2.0-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Hello");
        console.log("Response:", result.response.text());
    } catch (error) {
        console.error("Error with gemini-2.0-flash:", error.message);
    }
}

test();
