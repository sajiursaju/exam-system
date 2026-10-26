# Exam Portal: Frontend

Next.js 15 (App Router) + TypeScript + Tailwind 4. Talks to the Express backend through a built-in proxy,
so there is no CORS setup and the login cookie belongs to this site.

## Folder layout

Put this folder next to your backend:

```
exam-system/
├── backend/      (your exam-backend folder, renamed)
└── frontend/     (this folder)
```

## Run it (Windows PowerShell), in this order

1. Start **MySQL** in XAMPP (green "Running").
2. Backend, in `exam-system\backend` (first time only: steps 2 to 7 of the backend README):
   ```powershell
   npm run dev
   ```
   Check http://localhost:5000/api/health shows `{"status":"ok"}`. Leave this terminal open.
3. Frontend, in a **second** terminal inside `exam-system\frontend`:
   ```powershell
   npm install
   npm run dev
   ```
4. Open http://localhost:3000

`.env.local` is already included. It only holds `BACKEND_URL=http://localhost:5000`.
The backend `.env` must keep `CLIENT_URL="http://localhost:3000"` (it already does).

## Test accounts

Created by the backend seeds (`npm run seed` and `npm run seed:demo` in the backend folder):

| Role | Email | Password |
|---|---|---|
| Admin | admin@exam.com | Admin@12345 |
| Teacher | teacher@exam.com | Pass@12345 |
| Student | student@exam.com | Pass@12345 |

## Test checklist

1. Log in as the **student**. You see "BCS Model Test 1 (Demo)". Click **Start exam**.
2. Answer a few questions, reload the page. Answers and the remaining time come back.
3. Switch to another browser tab and back. A tab-switch warning appears (after 3 switches the exam auto-submits).
4. Click **Submit exam**. You see the score. The short-answer question shows "Waiting for your teacher".
5. Log out, log in as the **teacher**. Open the exam, then **Review and grade** on the student, give marks, **Save marks**.
6. Back as the student, the result now shows the final score and pass or fail.
7. Log in as **admin**. Under **People**, register a new account at /register first, then **Approve** it.
8. In the exam page, **Download CSV for Excel** saves the results file.

## Pages

| URL | Who | What |
|---|---|---|
| /login, /register | anyone | sign in, create an account (needs admin approval) |
| /admin/dashboard | admin, teacher | exam list; admin also approves and deactivates people |
| /admin/exams/new | admin, teacher | create an exam |
| /admin/exams/[id] | admin, teacher | add, edit, delete questions; see submissions; CSV |
| /admin/attempts/[id] | admin, teacher | review one submission and grade short answers |
| /student/dashboard | student | open exams, start or resume, past attempts |
| /student/exam/[attemptId] | student | the exam screen with timer and answer sheet |
| /student/results/[attemptId] | student | score and answer review |

## Build for production

```powershell
npm run build
npm start
```
