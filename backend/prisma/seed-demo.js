// Optional demo data: a teacher, a student and one BCS-style exam with 6 questions.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/lib/prisma");

async function main() {
  const passwordHash = await bcrypt.hash("Pass@12345", 10);

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@exam.com" },
    update: {},
    create: { name: "Demo Teacher", email: "teacher@exam.com", passwordHash, role: "TEACHER", status: "ACTIVE" },
  });

  await prisma.user.upsert({
    where: { email: "student@exam.com" },
    update: {},
    create: { name: "Demo Student", email: "student@exam.com", passwordHash, role: "STUDENT", status: "ACTIVE" },
  });

  const existing = await prisma.exam.findFirst({ where: { title: "BCS Model Test 1 (Demo)" } });
  if (existing) {
    console.log("Demo exam already exists, skipping.");
    return;
  }

  const now = Date.now();
  const exam = await prisma.exam.create({
    data: {
      title: "BCS Model Test 1 (Demo)",
      description: "Demo exam with MCQ, true/false and short answer questions.",
      durationMinutes: 20,
      startTime: new Date(now - 60 * 60 * 1000),
      endTime: new Date(now + 30 * 24 * 60 * 60 * 1000),
      totalMarks: 8,
      passingMarks: 4,
      shuffleQuestions: true,
      maxTabSwitches: 3,
      createdBy: teacher.id,
    },
  });

  await prisma.question.createMany({
    data: [
      { examId: exam.id, questionText: "বাংলাদেশের রাজধানী কোনটি?", questionType: "MCQ", options: ["ঢাকা", "চট্টগ্রাম", "খুলনা", "সিলেট"], correctAnswer: "ঢাকা", marks: 1 },
      { examId: exam.id, questionText: "Who wrote the national anthem of Bangladesh?", questionType: "MCQ", options: ["Kazi Nazrul Islam", "Rabindranath Tagore", "Jibanananda Das", "Lalon Shah"], correctAnswer: "Rabindranath Tagore", marks: 1 },
      { examId: exam.id, questionText: "In what year did Bangladesh gain independence?", questionType: "MCQ", options: ["1947", "1952", "1971", "1975"], correctAnswer: "1971", marks: 1 },
      { examId: exam.id, questionText: "The Sundarbans is the largest mangrove forest in the world.", questionType: "TRUE_FALSE", options: ["True", "False"], correctAnswer: "True", marks: 1 },
      { examId: exam.id, questionText: "The Padma river flows through Dhaka city.", questionType: "TRUE_FALSE", options: ["True", "False"], correctAnswer: "False", marks: 1 },
      { examId: exam.id, questionText: "Write a short note on the Language Movement of 1952.", questionType: "SHORT_ANSWER", correctAnswer: null, marks: 3 },
    ],
  });

  console.log("Demo data created.");
  console.log("Teacher: teacher@exam.com / Pass@12345");
  console.log("Student: student@exam.com / Pass@12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
