import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getCourses = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.teacherId;

    if (!teacherId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const courses = await prisma.course.findMany({
      where: { teacherId },
    });

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.teacherId;
    const { name } = req.body;

    if (!teacherId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Course name is required' });
    }

    const course = await prisma.course.create({
      data: {
        name,
        teacherId,
      },
    });

    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create course' });
  }
};
