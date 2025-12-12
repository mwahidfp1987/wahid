import { GoogleGenAI } from "@google/genai";
import { ProjectData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProjectReport = async (projectData: ProjectData): Promise<string> => {
  try {
    const prompt = `
      You are a Senior QA Engineer. Analyze the following project testing report data.
      
      Project Name: ${projectData.name}
      Project Completion: ${projectData.progress}%
      
      Issues List:
      ${JSON.stringify(projectData.issues.slice(-10), null, 2)}
      
      Please provide a concise executive summary formatted in Markdown:
      1. Overall Risk Assessment (Low/Medium/High).
      2. Key patterns in the defects/issues.
      3. One specific recommendation for the "Corrective Actions" to prevent future recurrence.
      4. A brief encouraging remark for the team.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Analysis could not be generated at this time.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Error generating AI analysis. Please check your API key configuration.";
  }
};
