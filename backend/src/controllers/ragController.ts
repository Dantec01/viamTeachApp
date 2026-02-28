import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';
import { GoogleGenerativeAI } from "@google/generative-ai";

export const askGuIA = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.teacherId;
    const { courseId, question } = req.body;

    if (!teacherId || !courseId || !question) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    // 1. Retrieve all observations for the given course
    const studentsInCourse = await prisma.student.findMany({
      where: { courseId: parseInt(courseId) },
      select: { id: true }
    });
    
    const studentIds = studentsInCourse.map(s => s.id);

    const observations = await prisma.observation.findMany({
      where: {
        teacherId,
        studentId: { in: studentIds }
      },
      include: {
        student: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (observations.length === 0) {
      return res.status(200).json({ answer: "No tengo suficientes registros en este curso para hacer un análisis." });
    }

    // 2. Augment Context
    let contextStr = "Contexto de Registros del Curso:\n";
    observations.forEach(obs => {
      const date = new Date(obs.createdAt).toLocaleDateString("es-ES");
      const obsAny = obs as any;
      contextStr += `- El ${date} a ${obs.student.name} ${obs.student.lastname}: [Sentimiento: ${obsAny.sentiment}] [Etiquetas: ${obsAny.tags}] -> "${obs.content}"\n`;
    });

    const prompt = `
    Eres "GuIA", el asistente de inteligencia artificial exclusivo para profesores.
    Tu objetivo es responder de manera proactiva, analítica y amigable la pregunta del profesor basándote ÚNICAMENTE en el siguiente contexto de registros.
    
    Cosas a tener en cuenta:
    - Sé directo y útil.
    - Si la pregunta es sobre un alumno específico, busca sus registros en el contexto.
    - Si te piden un resumen, resume los patrones.
    - Nunca inventes datos que no estén en el contexto.
    - Formatea tu respuesta usando markdown para que sea fácil de leer (usa negritas para nombres, listas si es necesario).

    ${contextStr}

    Pregunta del Profesor: "${question}"
    Respuesta de GuIA:`;

    // 3. Generate
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const answer = await result.response.text();

    res.status(200).json({ answer });
  } catch (error) {
    console.error("RAG Error:", error);
    res.status(500).json({ error: 'Failed to process RAG query' });
  }
};
