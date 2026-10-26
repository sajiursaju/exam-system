# Online Examination System: Backend

Express + Prisma + MySQL (XAMPP). JWT in HttpOnly cookie, roles: ADMIN / TEACHER / STUDENT.

## Setup on Windows (XAMPP), in this order

1. Start **MySQL** in the XAMPP Control Panel (green "Running").
2. Create the database (PowerShell, inside this folder):
   ```powershell
   & "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS exam_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```
3. Copy `.env.example` to `.env` (XAMPP root has no password, so leave `DATABASE_URL` as is):
   ```powershell
   copy .env.example .env
   ```
4. Install packages:
   ```powershell
   npm install
   ```
5. Create the tables:
   ```powershell
   npx prisma migrate dev --name init
   ```
6. Create the admin account (`admin@exam.com` / `Admin@12345`):
   ```powershell
   npm run seed
   ```
7. (Optional) demo teacher, student and a 6-question exam (`teacher@exam.com`, `student@exam.com`, password `Pass@12345`):
   ```powershell
   npm run seed:demo
   ```
8. Start the API:
   ```powershell
   npm run dev
   ```
9. Open http://localhost:5000/api/health and you should see `{"status":"ok"}`.

## Folder map

```
prisma/schema.prisma        the 5 tables
prisma/seed.js              first admin
prisma/seed-demo.js         demo teacher, student, exam
src/server.js               starts the server + auto-submit job (every minute)
src/app.js                  middleware + route groups
src/config/env.js           reads .env
src/lib/                    prisma connection, helpers, access rules, shuffle
src/middleware/             auth (cookie), role, error handler
src/routes/                 URL -> controller
src/controllers/            read request, validate, reply
src/services/               scoring + timer rules (business logic)
```

## API

| URL | Method | Who | Purpose |
|---|---|---|---|
| /api/auth/register | POST | anyone | create account (PENDING) |
| /api/auth/login | POST | anyone | login, sets cookie |
| /api/auth/logout | POST | anyone | clear cookie |
| /api/auth/me | GET | logged in | current user |
| /api/users?role=&status= | GET | admin | list users |
| /api/users/:id/status | PATCH | admin | ACTIVE / DEACTIVATED |
| /api/exams | GET, POST | all, staff | list, create |
| /api/exams/:id | GET, PUT, DELETE | all, staff, staff | read, edit, delete |
| /api/exams/:examId/questions | GET, POST | staff | question bank |
| /api/exams/:examId/questions/bulk | POST | staff | import many |
| /api/questions/:id | PUT, DELETE | staff | edit, delete |
| /api/attempts/start | POST | student | begin or resume `{examId}` |
| /api/attempts/mine | GET | student | history |
| /api/attempts/:id | GET | student | reload exam screen |
| /api/attempts/:id/answer | PUT | student | save answer / mark for review |
| /api/attempts/:id/tab-switch | POST | student | report tab switch |
| /api/attempts/:id/submit | POST | student | finish |
| /api/attempts/:id/result | GET | student, staff | score breakdown |
| /api/attempts/exam/:examId | GET | staff | all submissions |
| /api/attempts/exam/:examId/export | GET | staff | CSV for Excel |
| /api/attempts/:id/grade | PATCH | staff | grade short answers `{grades:[{questionId,marks}]}` |

## Security rules built in

- Correct answers are never sent while a student is taking the exam.
- The server owns the clock: deadline = start + duration (never after the exam window ends). Late saves are rejected and the attempt is auto-submitted.
- Scoring happens only on the server.
- A student can attempt an exam once (reload resumes it).
- Questions lock after the first student starts.
- `maxTabSwitches = 0` turns the tab-switch check off.
- Passwords are bcrypt hashes. Deactivating a user blocks them immediately.

## Quick PowerShell test

```powershell
$body = @{ email="admin@exam.com"; password="Admin@12345" } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:5000/api/auth/login -Method Post -Body $body -ContentType "application/json" -SessionVariable s
Invoke-RestMethod -Uri http://localhost:5000/api/exams -WebSession $s
```
