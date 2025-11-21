import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ReceiptData } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export async function parseReceiptImage(imageFile: File): Promise<ReceiptData> {
    if (!API_KEY) {
        throw new Error("Missing Gemini API Key");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    Analyze this receipt image and extract the following data in strict JSON format:
    - items: an array of objects with "description" (string) and "price" (number).
    - subtotal: number
    - tax: number
    - tip: number (if present, otherwise 0)
    - total: number

    Rules:
    - Ignore "Thank You" or decorative text.
    - Group modifiers with their parent item if possible (e.g. "Burger" + "Cheese" -> "Burger with Cheese").
    - Ensure all prices are numbers (e.g. 10.50, not "$10.50").
    - If tax is not explicitly listed, try to calculate it or set to 0.
    - Return ONLY the JSON object, no markdown formatting.
  `;

    // Convert file to base64
    const base64Data = await fileToGenerativePart(imageFile);

    try {
        const result = await model.generateContent([prompt, base64Data]);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini Raw Response:", text); // Debug log

        // Clean up markdown code blocks if present
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const data = JSON.parse(jsonString);

            // Add IDs to items
            const itemsWithIds = data.items.map((item: any) => ({
                ...item,
                id: crypto.randomUUID(),
                assignedTo: []
            }));

            return {
                ...data,
                items: itemsWithIds
            };
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.error("Failed JSON string:", jsonString);
            throw new Error("Failed to parse AI response as JSON");
        }
    } catch (error: any) {
        console.error("Error parsing receipt:", error);
        throw new Error(error.message || "Failed to parse receipt. Please try again.");
    }
}

async function fileToGenerativePart(file: File) {
    const base64EncodedDataPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString().split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: await base64EncodedDataPromise as string,
            mimeType: file.type,
        },
    };
}
