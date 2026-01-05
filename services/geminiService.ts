
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Genera un resumen profesional de notas clínicas.
 */
export const summarizeClinicalNotes = async (notes: string) => {
  try {
    // Correct initialization using process.env.API_KEY directly as per guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resume de forma profesional y concisa las siguientes notas clínicas de un paciente. Enfócate estrictamente en hallazgos, diagnóstico y plan de tratamiento: "${notes}"`,
      config: {
        maxOutputTokens: 600,
        thinkingConfig: { thinkingBudget: 300 }
      }
    });
    return response.text?.trim() || "No se pudo generar el resumen clínico.";
  } catch (error) {
    console.error("Gemini Error (Summarization):", error);
    return "Error de conexión con el asistente de IA.";
  }
};

/**
 * Sugiere diagnósticos basados en hallazgos preliminares.
 */
export const suggestDiagnosis = async (findings: string) => {
  try {
    // Correct initialization using process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analiza los siguientes hallazgos clínicos: "${findings}". Proporciona una lista de posibles diagnósticos diferenciales y sugiere los servicios clínicos más adecuados. Responde exclusivamente en JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de diagnósticos sugeridos basados en hallazgos."
            },
            recommendedService: { 
              type: Type.STRING,
              description: "Servicio o categoría clínica más recomendada."
            },
            rationale: {
              type: Type.STRING,
              description: "Breve razonamiento del análisis."
            }
          },
          required: ["suggestions", "recommendedService"]
        },
        // Max budget for gemini-3-pro-preview for complex reasoning tasks.
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error (Diagnostic Suggestion):", error);
    return null;
  }
};
