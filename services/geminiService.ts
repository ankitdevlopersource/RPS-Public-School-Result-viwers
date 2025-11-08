
import { GoogleGenAI, Type } from "@google/genai";
import { Student } from '../types';

// This function generates mock student data using the Gemini API.
// It's a great way to quickly populate the application for demonstration purposes.
export const generateMockStudents = async (count: number): Promise<Student[]> => {
    // IMPORTANT: In a real production environment, the API key should be handled securely
    // and not exposed on the client-side. This assumes the API key is provided
    // via an environment variable `process.env.API_KEY`.
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // The prompt instructs the AI on how to structure the JSON output.
    const prompt = `Generate a list of ${count} unique, fictional student records for a school in India. Each student needs a unique 6-digit roll number starting with '100'. Provide realistic names, father's names, and dates of birth (YYYY-MM-DD format) for students who would be in high school. Assign marks between 40 and 100 for all subjects. Do not include the 'studentImage' field in your response.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                // The schema defines the exact structure of the expected JSON response.
                // This makes the AI's output predictable and safe to parse.
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            rollNumber: { type: Type.STRING },
                            studentName: { type: Type.STRING },
                            fatherName: { type: Type.STRING },
                            dob: { type: Type.STRING },
                            marks: {
                                type: Type.OBJECT,
                                properties: {
                                    hindi: { type: Type.NUMBER },
                                    english: { type: Type.NUMBER },
                                    mathematics: { type: Type.NUMBER },
                                    science: { type: Type.NUMBER },
                                    socialScience: { type: Type.NUMBER },
                                    sanskrit: { type: Type.NUMBER },
                                },
                                required: ["hindi", "english", "mathematics", "science", "socialScience", "sanskrit"],
                            },
                        },
                        required: ["rollNumber", "studentName", "fatherName", "dob", "marks"],
                    },
                },
            },
        });
        
        // Parse the JSON string from the response
        const generatedData = JSON.parse(response.text);

        // Add the empty studentImage property to conform to the Student type
        return generatedData.map((student: Omit<Student, 'studentImage'>) => ({
            ...student,
            studentImage: '', // Initialize with an empty image
        }));

    } catch (error) {
        console.error("Error generating mock students with Gemini:", error);
        throw new Error("Failed to generate mock data. Please check the API key and network connection.");
    }
};
