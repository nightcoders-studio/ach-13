import { GoogleGenAI, Type } from '@google/genai';
import { Question, DictionaryResult, Story } from '../types';

// Initialize the SDK. Assumes API_KEY is available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
const MODEL_NAME = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `You are an expert in the Acehnese language (Bahasa Aceh) and Indonesian. 
Your goal is to help users learn Acehnese. Provide accurate translations, culturally relevant examples, and clear explanations.
IMPORTANT: Always respond entirely in Bahasa Indonesia. Never use English in your responses. All explanations, nuances, context, and feedback must be written in Bahasa Indonesia.`;

export const generateLesson = async (topic: string): Promise<Question[]> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Generate a short language lesson about "${topic}" for an Indonesian speaker learning Acehnese. Create 4 multiple-choice questions.`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING, description: "The question in Indonesian, e.g., 'Apa bahasa Aceh dari ...?'" },
                            options: { 
                                type: Type.ARRAY, 
                                items: { type: Type.STRING },
                                description: "4 possible answers in Acehnese"
                            },
                            answer: { type: Type.STRING, description: "The correct answer from the options" },
                            type: { type: Type.STRING, description: "Always 'multiple-choice'" }
                        },
                        required: ["question", "options", "answer", "type"]
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as Question[];
        }
        return [];
    } catch (error) {
        console.error("Error generating lesson:", error);
        throw error;
    }
};

export const translateWord = async (word: string): Promise<DictionaryResult | null> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Translate the word or phrase "${word}" between Indonesian and Acehnese (detect the source language automatically). Provide the translation, explain any cultural nuances or context, and give 2 example sentences.`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING, description: "The original word queried" },
                        translation: { type: Type.STRING, description: "The direct translation" },
                        nuances: { type: Type.STRING, description: "Explanation of context, formality, or cultural nuances" },
                        examples: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    aceh: { type: Type.STRING },
                                    indo: { type: Type.STRING }
                                },
                                required: ["aceh", "indo"]
                            }
                        }
                    },
                    required: ["word", "translation", "nuances", "examples"]
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as DictionaryResult;
        }
        return null;
    } catch (error) {
        console.error("Error translating word:", error);
        throw error;
    }
};

export const generateStory = async (level: string = 'beginner'): Promise<Story | null> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Write a very short Acehnese folklore, legend, or hikayat (4-5 sentences) for a ${level} learner. Provide the Indonesian translation for each sentence.`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "Title of the story in Acehnese" },
                        sentences: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    aceh: { type: Type.STRING },
                                    indo: { type: Type.STRING }
                                },
                                required: ["aceh", "indo"]
                            }
                        }
                    },
                    required: ["title", "sentences"]
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as Story;
        }
        return null;
    } catch (error) {
        console.error("Error generating story:", error);
        throw error;
    }
};

export const analyzeImageText = async (base64Image: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: {
                role: 'user',
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64Image.split(',')[1]
                        }
                    },
                    {
                        text: "Extract any text from this image. If it is in Acehnese, translate it to Indonesian. If it is in Indonesian, translate it to Acehnese. If there is no text, say 'Tidak ada teks yang terdeteksi'. Provide a brief, helpful response."
                    }
                ]
            },
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
            }
        });
        return response.text || "Gagal menganalisis gambar.";
    } catch (error) {
        console.error("Error analyzing image:", error);
        throw error;
    }
};

export const evaluatePronunciation = async (audioBase64: string, mimeType: string, expectedWord: string): Promise<{score: number, feedback: string}> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: {
                role: 'user',
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: audioBase64.split(',')[1]
                        }
                    },
                    {
                        text: `Evaluate the pronunciation of the Acehnese word/phrase "${expectedWord}" in this audio. Provide a score from 0 to 100 and brief feedback in Indonesian on how to improve. Return JSON.`
                    }
                ]
            },
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER, description: "Score from 0 to 100" },
                        feedback: { type: Type.STRING, description: "Brief feedback in Indonesian" }
                    },
                    required: ["score", "feedback"]
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        return { score: 0, feedback: "Gagal mengevaluasi audio." };
    } catch (error) {
        console.error("Error evaluating pronunciation:", error);
        throw error;
    }
};
