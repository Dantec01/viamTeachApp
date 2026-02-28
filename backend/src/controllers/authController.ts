import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const existingTeacher = await prisma.teacher.findUnique({
      where: { email },
    });

    if (existingTeacher) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await prisma.teacher.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = jwt.sign({ teacherId: teacher.id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ token, teacher: { id: teacher.id, email: teacher.email, name: teacher.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const teacher = await prisma.teacher.findUnique({
      where: { email },
    });

    if (!teacher) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ teacherId: teacher.id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({ token, teacher: { id: teacher.id, email: teacher.email, name: teacher.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
