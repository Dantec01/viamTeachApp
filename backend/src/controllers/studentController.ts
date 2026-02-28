import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.teacherId;
    const { courseId } = req.query;

    if (!teacherId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    const students = await prisma.student.findMany({
      where: { 
        courseId: parseInt(courseId as string),
        course: { teacherId } 
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.teacherId;
    const { name, lastname, courseId, avatarColor } = req.body;

    if (!teacherId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || !lastname || !courseId) {
      return res.status(400).json({ error: 'Name, lastname, and courseId are required' });
    }

    const course = await prisma.course.findFirst({
      where: { id: parseInt(courseId), teacherId }
    });

    if (!course) {
       return res.status(403).json({ error: 'Course not found or unauthorized' })
    }

    const student = await prisma.student.create({
      data: {
        name,
        lastname,
        avatarColor: avatarColor || "230 40% 60%",
        courseId: parseInt(courseId),
      },
    });

    res.status(201).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create student' });
  }
};

import { analyzeImageOCR } from '../services/aiService';

export const scanStudents = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const imagePath = req.file.path;
        console.log("Starting Gemini Vision OCR for:", imagePath);

        const extractedNames = await analyzeImageOCR(imagePath, req.file.mimetype);
        
        // Clean up temp file
        fs.unlink(imagePath, (err) => {
            if (err) console.error("Error deleting temp file:", err);
        });

        res.status(200).json({ names: extractedNames });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error during scan' });
    }
};

