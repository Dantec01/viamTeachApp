import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface AnalysisResponse {
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  tags: string;
}

export const analyzeObservationAI = async (text: string): Promise<AnalysisResponse> => {
  if (!text || text.trim().length === 0) {
    return { sentiment: "NEUTRAL", tags: "General" };
  }

  const prompt = `Analiza esta observación docente de un estudiante y clasifícala. 
  Debes ser objetivo. 
  
  Devuélveme EXCLUSIVAMENTE un bloque de código JSON con los siguientes campos:
  - "sentiment": Un string que debe ser uno de estos tres valores: "POSITIVE", "NEUTRAL", "NEGATIVE".
  - "tags": Un string con palabras clave separadas por comas (ejemplo: "Matemáticas, Social, Participación").
  
  Observación del docente: "${text}"`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    
    // Clean JSON from potential markdown formatting
    const jsonStr = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
      
    const analysis: AnalysisResponse = JSON.parse(jsonStr);
    
    // Basic validation
    if (!["POSITIVE", "NEUTRAL", "NEGATIVE"].includes(analysis.sentiment)) {
        analysis.sentiment = "NEUTRAL";
    }
    
    return analysis;
  } catch (error) {
    console.error("Gemini AI Analysis failed:", error);
    // Fallback if AI fails
    return { 
      sentiment: text.includes("bien") || text.includes("logro") ? "POSITIVE" : "NEUTRAL", 
      tags: "Auto-generado" 
    };
  }
};
export const analyzeAudioAI = async (filePath: string, mimeType: string): Promise<AnalysisResponse & { transcript?: string }> => {
  const prompt = `Transcribe este audio y luego analiza su sentimiento. 
  Devuélveme EXCLUSIVAMENTE un bloque de código JSON con los siguientes campos:
  - "sentiment": Un string que debe ser uno de estos tres valores: "POSITIVE", "NEUTRAL", "NEGATIVE".
  - "tags": Un string con palabras clave separadas por comas (ejemplo: "Matemáticas, Social, Participación").
  - "transcript": Un string con la transcripción literal (o un resumen fiel) del audio.`;

  try {
    const fs = await import('fs/promises');
    const audioBytes = await fs.readFile(filePath);
    
    let cleanMime = mimeType || "audio/mp3";
    if (cleanMime.includes("m4a") || cleanMime.includes("mp4")) cleanMime = "audio/mp4";
    if (cleanMime.includes("webm")) cleanMime = "audio/webm";
    if (cleanMime.includes("ogg")) cleanMime = "audio/ogg";
    if (cleanMime.includes("wav")) cleanMime = "audio/wav";

    // We send the audio inline to Gemini Flash
    const audioPart = {
      inlineData: {
        data: audioBytes.toString("base64"),
        mimeType: cleanMime
      }
    };

    const result = await model.generateContent([prompt, audioPart]);
    const response = await result.response;
    const rawText = response.text();
    
    const jsonStr = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
      
    const analysis: AnalysisResponse & { transcript?: string } = JSON.parse(jsonStr);
    
    if (!["POSITIVE", "NEUTRAL", "NEGATIVE"].includes(analysis.sentiment)) {
        analysis.sentiment = "NEUTRAL";
    }
    
    return analysis;
  } catch (error) {
    console.error("Gemini AI Audio Analysis failed:", error);
    return { 
      sentiment: "NEUTRAL", 
      tags: "Voz, Fallo-Transcipción",
      transcript: "No se pudo transcribir el audio por un error de AI."
    };
  }
};
export const analyzeImageOCR = async (filePath: string, mimeType: string): Promise<string[]> => {
  const prompt = `Eres un asistente de extracción de datos. Analiza esta imagen de una lista de asistencia escolar. Extrae únicamente los nombres completos de los estudiantes y devuélvelos estrictamente en un formato JSON como este: ["Mateo Alvarez", "Ana Bernal"]. Ignora números de lista, fechas o marcas de asistencia. Si no encuentras nombres, devuelve "[]". NO devuelvas NADA MÁS que el arreglo JSON puro.`;

  try {
    const fs = await import('fs/promises');
    const imageBytes = await fs.readFile(filePath);
    
    // We send the image inline to Gemini Flash
    const imagePart = {
      inlineData: {
        data: imageBytes.toString("base64"),
        mimeType: mimeType || "image/jpeg"
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const rawText = response.text();
    
    // Clean JSON from potential markdown formatting
    const jsonStr = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
      
    const names: string[] = JSON.parse(jsonStr);
    
    if (Array.isArray(names)) {
        return names;
    }
    
    return [];
  } catch (error) {
    console.error("Gemini OCR Analysis failed:", error);
    return [];
  }
};
