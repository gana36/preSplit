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
    {
      "items": [
        { 
          "description": "Item Name", 
          "price": 8.99, 
          "originalPrice": 10.99, 
          "discount": 2.00 
        }
      ],
      "subtotal": 8.99,
      "tax": 1.00,
      "tip": 2.00,
      "total": 11.99
    }

    Rules:
    1. Extract all line items.
    2. If an item has a discount/coupon/savings listed below it or associated with it:
       - Calculate the final "price" = original price - discount.
       - Set "originalPrice" to the listed price.
       - Set "discount" to the discount amount (positive number).
    3. If no discount, just set "price" and omit "originalPrice"/"discount".
    4. Do not list discounts as separate items. Merge them into the parent item.
    5. Ignore "Thank You" or other non-item text.
    6. Ensure all numbers are floats.
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
