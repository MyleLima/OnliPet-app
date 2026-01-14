
import { GoogleGenAI } from "@google/genai";

// Always use the process.env.API_KEY directly and use a named parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAnimalCuriosity = async (animal: string = "cachorros e gatos") => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere uma curiosidade curta, divertida e educativa sobre ${animal} para um aplicativo de resgate animal. Seja amigável e use emojis.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });
    // The response.text property is used directly.
    return response.text || "Você sabia que o amor de um animal resgatado é para sempre? 🐾";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Você sabia que o amor de um animal resgatado é para sempre? 🐾";
  }
};

export const getPetCareAdvice = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      // Must specify a supported model name.
      model: "gemini-3-flash-preview",
      contents: `Você é um especialista em cuidado animal do OnliPet. Responda à seguinte dúvida de forma clara e útil: ${query}`,
      config: {
        systemInstruction: "Seja empático, direto e foque no bem-estar animal. Sempre recomende consultar um veterinário para casos graves.",
      }
    });
    // The response.text property is used directly.
    return response.text || "Desculpe, não consegui processar sua dúvida agora. Tente novamente mais tarde.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, não consegui processar sua dúvida agora. Tente novamente mais tarde.";
  }
};
