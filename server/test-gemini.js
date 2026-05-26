import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("hello");
    console.log(result.response.text());
  } catch (err) {
    console.error("Gemini Error:", err);
  }
}
test();
