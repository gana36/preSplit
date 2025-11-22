import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const IMAGE_PATH = '/Users/karthik/.gemini/antigravity/brain/bec43868-2574-481c-9df3-4681ec5d526d/uploaded_image_1763842565680.png';

if (!API_KEY) {
    console.error("No API Key found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}

async function test() {
    try {
        console.log("Testing discount parsing with gemini-2.0-flash...");
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

        const imagePart = fileToGenerativePart(IMAGE_PATH, "image/png");
        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text();
        console.log("Raw Response:", text);

        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(jsonString);

        console.log("Parsed Data:", JSON.stringify(data, null, 2));

        const hasMergedDiscounts = data.items.some(item => item.discount && item.discount > 0);
        if (hasMergedDiscounts) {
            console.log("SUCCESS: Found merged discounts!");
        } else {
            console.error("FAILURE: No merged discounts found.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
