import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.observation.deleteMany();
  await prisma.student.deleteMany();
  await prisma.course.deleteMany();
  await prisma.teacher.deleteMany();

  // Create Teacher
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const teacher = await prisma.teacher.create({
    data: {
      email: 'profe@guia.edu',
      password: hashedPassword,
      name: 'Profesor GuIA',
    },
  });

  console.log('Teacher created:', teacher.email);

  // Create Courses
  const courses = await Promise.all([
    prisma.course.create({ data: { name: '5to Sec A', teacherId: teacher.id } }),
    prisma.course.create({ data: { name: '3ro Sec B', teacherId: teacher.id } }),
    prisma.course.create({ data: { name: '1ro Primaria', teacherId: teacher.id } }),
  ]);

  console.log('Courses created');

  // Create Students for 5to Sec A
  const students5A = await Promise.all([
    prisma.student.create({ data: { name: 'Mateo', lastname: 'García', avatarColor: '340 60% 85%', courseId: courses[0].id } }),
    prisma.student.create({ data: { name: 'Valentina', lastname: 'López', avatarColor: '200 60% 85%', courseId: courses[0].id } }),
    prisma.student.create({ data: { name: 'Sebastián', lastname: 'Rodríguez', avatarColor: '150 50% 85%', courseId: courses[0].id } }),
    prisma.student.create({ data: { name: 'Camila', lastname: 'Sánchez', avatarColor: '40 60% 85%', courseId: courses[0].id } }),
    prisma.student.create({ data: { name: 'Nicolás', lastname: 'Martínez', avatarColor: '270 50% 85%', courseId: courses[0].id } }),
    prisma.student.create({ data: { name: 'Isabella', lastname: 'Pérez', avatarColor: '20 70% 85%', courseId: courses[0].id } }),
  ]);

  console.log('Students created');

  // Create some sample observations
  await prisma.observation.create({
    data: {
      content: 'Participó activamente en la discusión sobre ética.',
      sentiment: 'POSITIVE',
      tags: 'Participación,Liderazgo',
      studentId: students5A[0].id,
      teacherId: teacher.id,
    },
  });

  await prisma.observation.create({
    data: {
      content: 'Le costó concentrarse en la tarea individual.',
      sentiment: 'NEGATIVE',
      tags: 'Concentración',
      studentId: students5A[1].id,
      teacherId: teacher.id,
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
