import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';
import { analyzeObservationAI, analyzeAudioAI } from '../services/aiService';
import fs from 'fs';

export const getObservations = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.teacherId;
    const { studentId, courseId } = req.query;

    if (!teacherId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const where: any = { teacherId };
    
    if (studentId) {
        where.studentId = parseInt(studentId as string);
    } else if (courseId) {
        where.student = { courseId: parseInt(courseId as string) };
    }

    const observations = await prisma.observation.findMany({
      where,
      include: {
          student: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(observations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch observations' });
  }
};


export const createObservation = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.teacherId;
    const { studentId, content, audioUrl } = req.body;

    if (!teacherId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    if (!content && !audioUrl) {
      return res.status(400).json({ error: 'Either content or audioUrl must be provided' });
    }

    // Verify student belongs to teacher
    const student = await prisma.student.findFirst({
      where: {
        id: parseInt(studentId),
        course: { teacherId }
      }
    });

    if (!student) {
      return res.status(403).json({ error: 'Student not found or unauthorized' })
    }

    // --- GEMINI AI ANALYSIS ---
    let sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" = "NEUTRAL";
    let tags = "General";

    if (content) {
        try {
            const aiResult = await analyzeObservationAI(content);
            sentiment = aiResult.sentiment;
            tags = aiResult.tags;
        } catch (aiErr) {
            console.error("AI Analysis skipped or failed:", aiErr);
        }
    }
    // ---------------------------

    const observation = await prisma.observation.create({
      data: {
        content,
        audioUrl,
        sentiment,
        tags,
        studentId: parseInt(studentId),
        teacherId,
      } as any,
    });

    res.status(201).json(observation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create observation' });
  }
};

export const updateObservation = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.teacherId;
    const { id } = req.params;
    const { content } = req.body;

    if (!teacherId || !id) {
      return res.status(401).json({ error: 'Unauthorized or missing ID' });
    }

    const observationId = parseInt(id as string);
    const existing = await prisma.observation.findFirst({
        where: { id: observationId, teacherId }
    }) as any;

    if (!existing) {
        return res.status(404).json({ error: 'Observation not found' });
    }

    let sentiment = existing.sentiment;
    let tags = existing.tags;

    if (content && content !== existing.content) {
        try {
            const aiResult = await analyzeObservationAI(content);
            sentiment = aiResult.sentiment;
            tags = aiResult.tags;
        } catch (err) {
            console.error("AI Analysis failed on update:", err);
        }
    }

    const updated = await prisma.observation.update({
      where: { id: observationId },
      data: {
          content,
          sentiment: sentiment as string,
          tags
      } as any
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update observation' });
  }
};

export const createObservationAudio = async (req: AuthRequest, res: Response) => {
  const file = req.file;
  if (!file) {
      return res.status(400).json({ error: 'No audio file provided' });
  }

  try {
    const teacherId = req.teacherId;
    const { studentId } = req.body;

    if (!teacherId || !studentId) {
      fs.unlinkSync(file.path);
      return res.status(401).json({ error: 'Unauthorized or missing studentId' });
    }

    // Verify student belongs to teacher
    const student = await prisma.student.findFirst({
      where: {
        id: parseInt(studentId),
        course: { teacherId }
      }
    });

    if (!student) {
      fs.unlinkSync(file.path);
      return res.status(403).json({ error: 'Student not found or unauthorized' })
    }

    // --- GEMINI AUDIO AI ANALYSIS ---
    let sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" = "NEUTRAL";
    let tags = "General";
    let transcript = "Audio recibido";

    try {
        const aiResult = await analyzeAudioAI(file.path, file.mimetype);
        sentiment = aiResult.sentiment;
        tags = aiResult.tags;
        transcript = aiResult.transcript || transcript;
    } catch (aiErr) {
        console.error("Audio AI Analysis failed:", aiErr);
    }
    // ---------------------------

    const observation = await prisma.observation.create({
      data: {
        content: `Voz: ${transcript}`,
        audioUrl: file.filename, // We just store the filename
        sentiment,
        tags,
        studentId: parseInt(studentId),
        teacherId,
      } as any,
    });

    // Cleanup temp file uploaded by multer
    // Usually you'd move this to a persistent storage (S3, Cloud Storage, or keep it in uploads/)
    // Let's keep it in uploads/ by NOT deleting it unless there's an error.
    
    res.status(201).json(observation);
  } catch (error) {
    console.error(error);
    if (file && fs.existsSync(file.path)) {
       fs.unlinkSync(file.path);
    }
    res.status(500).json({ error: 'Failed to create observation from audio' });
  }
};
