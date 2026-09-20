# Product Requirements Document (PRD)
## LearnFlow 2.0 — AI-Powered Personalized Learning & Competency Intelligence Platform

---

### Document Information
* **Product Name**: LearnFlow AI 2.0
* **Version**: 2.0.0 (Production Ready)
* **Author / Team**: Engineering & Learning Intelligence Team
* **Status**: Active & Implemented
* **Repository**: [hsxdev69/Learnflow](https://github.com/hsxdev69/Learnflow)
* **Tech Stack**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Prisma ORM, SQLite, Firebase Auth, Google Gemini AI API, jsPDF / HTML2Canvas.

---

## 1. Executive Summary & Vision

### 1.1 The Problem
Traditional engineering education platforms present a one-size-fits-all, passive learning model:
* **Passive Video Consumption**: Students watch hours of video lectures without active verification or retention checks.
* **Lack of Adaptive Progression**: Learners are forced into rigid, linear syllabi regardless of their prior background or existing proficiencies.
* **Disconnected Hackathon & Career Readiness**: Existing courseware focuses on rote theoretical exams without testing practical architecture, debugging, concurrency, or modern technical track requirements (GenAI, Cloud/DevOps, Mobile, Web3).
* **Missing Competency Visibility**: Students and faculty lack granular diagnostic visibility into specific skill gaps and actionable remediation roadmaps.

### 1.2 The Solution: LearnFlow 2.0
**LearnFlow 2.0** is an adaptive, competency-first engineering learning platform that blends AI-driven personalized curriculum roadmaps with active mastery evaluations:
1. **Adaptive Milestone Progression**: Learners progress through topic milestones only after demonstrating true competency (≥80% passing threshold on 30-question technical assessments).
2. **Dual Learning Materials**: Every topic features official handwritten-style conceptual notes alongside curated video lectures with millisecond-precision progress tracking.
3. **Downloadable Vector PDF Generator**: Generates formatted, multi-page handwritten notes with clear monospace code snippets, syntax blocks, and diagrams.
4. **Hackathon & Tech Skill Readiness Hub**: A dedicated domain-readiness section with 6 high-demand technical tracks, 48 scenario-based technical questions, 48-hour sprint execution roadmaps, and instant skill-gap diagnostics.
5. **Real-Time AI Engineering Tutor**: Embedded conversational assistant with LaTeX math support, code analysis, and contextual course assistance.
6. **Robust Dual Authentication**: Native Firebase Google Sign-In popup with profile avatar synchronization alongside standard email/password and demo accounts.

---

## 2. User Personas & Target Audience

### 2.1 Engineering Student (Learner)
* **Demographics**: Undergraduate engineering students (B.Tech / B.E. / BCA / MCA / B.Sc CS) across 1st to 4th year.
* **Branches**: Computer Engineering, Information Technology, AI & Data Science, Electronics & Communication, Mechanical, and Civil Engineering.
* **Goals**:
  * Build rock-solid fundamentals in Data Structures & Algorithms, Web Development, Cloud, and Machine Learning.
  * Prepare for technical interviews, hackathons, and capstone project submissions.
  * Receive personalized recommendations on "what to study next" without cognitive overload.

### 2.2 Faculty / Institutional Administrator
* **Demographics**: Professors, department heads, and academic administrators.
* **Goals**:
  * Monitor cohort competency progression across domains.
  * Upload lecture notes, syllabi, and reference videos.
  * Use AI to automatically generate, review, and publish 30-question topic quizzes from lecture materials.
  * Align curriculum with national standards and iGOT competency frameworks.

---

## 3. System Architecture & Core Modules

```mermaid
graph TD
    A[Client: Next.js 14 PWA / Mobile Web] --> B[Middleware & Client Cache Layer]
    B --> C[Next.js App Router API Routes]
    C --> D[Prisma ORM Client]
    D --> E[(SQLite Database / dev.db)]
    C --> F[Firebase Auth Service]
    C --> G[Google Gemini Generative AI]
    C --> H[PDF Generation Engine]
    
    subgraph Core User Features
        I[Personalized Dashboard]
        J[Topic Learning & Video Player]
        K[30-Question Quizzes]
        L[Hackathon Readiness Hub]
        M[Competency Gap Analytics]
        N[AI Engineering Assistant]
    end
    
    A --> Core User Features
```

---

## 4. Detailed Feature Specifications

### 4.1 Onboarding & Skill Profiling Flow (`/onboarding/`)
* **Multi-Step Guided Setup**:
  * **Step 1 (Basic Details)**: Full Name, Email, Gender, Date of Birth, Mobile Number.
  * **Step 2 (Academic Background)**: College/University, Branch, Academic Year (1st–4th), Semester, Graduation Year.
  * **Step 3 (Current Skill Inventory)**: Select existing technical proficiencies (Beginner, Intermediate, Advanced) with interactive skill tags.
  * **Step 4 (Target Career Goals)**: Choose primary engineering focus (e.g. Data Structures & Algorithms, Full-Stack Development, Machine Learning, Cloud/DevOps).
  * **Step 5 (Discovery & Learning Style)**: Referral attribution and preferred learning modality.
* **Post-Onboarding Action**: Automatically seeds the student's initial roadmap, sets `onboardingCompleted = true`, issues a refreshed session token, and redirects to the personalized dashboard.

---

### 4.2 Interactive Learner Dashboard (`/dashboard`)
* **"Ab Mujhe Kya Karna Hai?" (Active Milestone Card)**:
  * Prominently displays the current topic in progress.
  * Highlights prerequisite completion status (Notes Read + Video Watched).
  * Unlocks the 30-question quiz button once lecture materials are marked complete.
* **Instant Learning Path Switcher**: Seamless 0ms switching between enrolled courses (DSA, Python, Web Dev, ML, etc.) with in-memory state preservation.
* **Metrics Overview**:
  * Overall course completion percentage.
  * Average quiz score across all attempted assessments.
  * Topics completed vs total topics in curriculum.
* **Hackathon Readiness Quick Launcher**: Dedicated launcher card encouraging students to assess track readiness.
* **Adaptive Recommendations**: Suggested next actions based on detected skill gaps.

---

### 4.3 Topic Learning & Embedded Lecture Room (`/learn/[id]`)
* **Dual Content Delivery**:
  * **Official Handwritten-Style Notes**: Structured conceptual notes, syntax explanations, ASCII diagrams, and algorithmic complexity tables.
  * **Embedded Video Lecture**: High-definition video player with YouTube embed support, playback controls, and automatic video progress tracking (`/api/videos/[id]/progress`).
* **Milestone Checklist**:
  * `[✓] Read Topic Notes`
  * `[✓] Watch Lecture Video`
  * `[✓] Take 30-Question Competency Quiz (Requires ≥80% to Unlock Next Topic)`
* **Embedded PDF Export**: One-click download of vector PDF handwritten notes with preserved code syntax and clear monospace formatting.

---

### 4.4 30-Question Adaptive Competency Quizzes (`/quizzes/[id]`)
* **Comprehensive Evaluation**: 30 multiple-choice questions per topic covering easy, medium, and hard difficulty tiers.
* **Adaptive Mastery Threshold**:
  * **≥ 80% (Pass / Mastered)**: Unlocks the next milestone topic on the learning roadmap and awards competency mastery badges.
  * **< 80% (Developing / Retry Needed)**: Provides detailed explanations for every incorrect answer and prompts the student to review notes before retaking.
* **Interactive Quiz Runner**:
  * Elapsed timer with countdown/stopwatch modes.
  * Question progress indicator with answered/unanswered state tracking.
  * Real-time answer selection with smooth active radio cards.
* **Quiz Results Breakdown (`/quizzes/[id]/result`)**:
  * Overall score percentage dial.
  * Question-by-question review with correct answer badges and detailed explanations.
  * Immediate database persistence via `QuizAttempt` and `QuizAnswer` models.

---

### 4.5 Hackathon & Tech Skill Readiness Hub (`/hackathon-readiness`)
* **Purpose**: Prepare engineering students for competitive hackathons and industry technical challenges.
* **6 Dedicated Technical Tracks**:
  1. **AI, Machine Learning & GenAI**: RAG pipelines, Vector DBs (Chroma/Pinecone), Prompt engineering, FastAPI streaming, PyTorch.
  2. **Full-Stack Web Development & SaaS**: React/Next.js 14, Prisma ORM, WebSockets, ACID transactions, Tailwind CSS.
  3. **Mobile App Development**: React Native / Expo, Flutter, MMKV offline-first storage, Geolocation/Camera hardware, Reanimated.
  4. **Cloud, DevOps & Scalable Backend**: Docker multi-stage containers, Kubernetes, CI/CD GitHub Actions, Redis caching, Ingress.
  5. **Cybersecurity & Ethical Defense**: OWASP Top 10 mitigation, Zero-Trust architecture, IDOR, SSRF, Argon2id encryption.
  6. **Web3, Blockchain & Smart Contracts**: Solidity 0.8+, ReentrancyGuard, Viem/Wagmi, IPFS decentralized storage, Account Abstraction.
* **Core Requirements Matrix**: Expandable breakdown categorizing technologies into **Essential**, **Recommended**, and **Bonus**.
* **48-Hour Sprint Roadmap**: Hour 0–4 (Scaffold), Hour 4–24 (MVP), Hour 24–48 (Polish & Pitch).
* **Interactive 8-Question Scenario Assessment**:
  * Real-world engineering scenarios testing debugging, architectural decisions, and edge-case handling.
  * Live elapsed timer, difficulty tags, and competency categorization.
* **Instant Diagnostic Scorecard**:
  * Overall Readiness Score with circular gauge.
  * Performance Tiers: `🔥 Ready to Win` (≥85%), `⚡ Competitive Builder` (65–84%), `🛠️ Skill Sprint Needed` (45–64%), `📚 Preparation Phase` (<45%).
  * **Strong Points Breakdown**: Specific mastered technical concepts.
  * **Areas to Improve**: Detailed diagnostic feedback on missed technical concepts with explanations.
  * **Direct Course Remediation**: Direct links to matching LearnFlow courses to bridge identified gaps.

---

### 4.6 AI Engineering Assistant (`/assistant`)
* **Conversational AI Tutor**: Context-aware technical tutor powered by Google Gemini AI API (`gemini-1.5-flash`).
* **Capabilities**:
  * Explains complex algorithms (Dynamic Programming, Graph Traversal, Operating System Paging).
  * Formats code snippets with language-specific syntax highlighting.
  * Renders mathematical equations using LaTeX notation.
  * Provides hints and architectural trade-offs without simply giving away direct quiz answers.

---

### 4.7 Competency & Progress Analytics (`/competencies`)
* **Radar & Bar Visualizations**: Visual mapping of learner strength across statistical methods, algorithms, systems, and development.
* **Skill Gap Tracking**: Compares `currentScore` against `requiredLevel` with automated status assignments:
  * `STRONG` (Gap = 0)
  * `DEVELOPING` (Gap < 20%)
  * `NEEDS_IMPROVEMENT` (Gap 20–40%)
  * `CRITICAL_GAP` (Gap > 40%)

---

### 4.8 Administrator Portal (`/admin/*`)
* **Admin Dashboard (`/admin/dashboard`)**: Institutional overview, active learner counts, average competency scores.
* **Learner Management (`/admin/learners`)**: Student directory, branch filters, onboarding status, and individual attempt audits.
* **Curriculum Materials (`/admin/materials`)**: Upload PDFs, attach reference video links, assign to courses.
* **AI MCQ Generator (`/admin/generator`)**: Automated extraction and question generation from uploaded curriculum materials using Gemini AI.
* **Quiz Publishing Pipeline (`/admin/quizzes`)**: Review generated MCQs, edit distractors, and publish live to the student platform.

---

## 5. Authentication & Security Architecture

### 5.1 Dual Authentication Engine
1. **Firebase Authentication (`learnflow-bf3f7`)**:
   * **Google Sign-In Popup**: Uses `signInWithPopup(auth, googleProvider)` with `prompt: "select_account"`.
   * Directly triggers the genuine Google account chooser without intermediate mock modals.
   * Extracts verified Google profile data (`email`, `displayName`, `photoURL`, `uid`).
   * Renders the user's Google profile avatar in the header with `referrerPolicy="no-referrer"`.
2. **Standard Email & Password**:
   * Secure bcrypt hashing for local password storage.
   * Student ID / Roll Number login support for university environments.
3. **Quick Demo Accounts**: 1-click test credentials for evaluators (Harshal Patel, Dr. Arvind Saxena, Aryan Kulkarni, Demo Learner, Demo Admin).

### 5.2 Session Management & Tokens
* Cryptographically signed HMAC-SHA256 tokens stored in `session_token` cookies.
* `HttpOnly`, `Secure` (in production), `SameSite=Lax` configuration.
* Auto-restore fallback to verify sessions seamlessly across distributed serverless environments.

---

## 6. Database Schema (Prisma ORM & SQLite)

### 6.1 Core Data Models
* **`User`**: Account identity, branch, year, college, skills JSON, onboarding status, primary career goal.
* **`Course`**: Top-level curricula (DSA, Python, Web Dev, ML, Cloud, Cyber, DBMS, Java, C++, OS, Networks).
* **`Module` & `Topic`**: Hierarchical units containing order indices, slug identifiers, and prerequisite rules.
* **`UserTopicProgress`**: Tracks per-user topic state (`LOCKED`, `AVAILABLE`, `IN_PROGRESS`, `COMPLETED`, `MASTERED`).
* **`VideoProgress`**: Tracks video watch timestamps and completion booleans.
* **`Quiz` & `Question`**: Stores 30 multiple-choice questions per topic, options, correct answers, and explanations.
* **`QuizAttempt` & `QuizAnswer`**: Audit log of student quiz scores, percentages, and timestamps.
* **`Competency` & `UserCompetency`**: Granular skill competency framework and gap tracking.
* **`Assessment` & `AssessmentAttempt`**: Standardized assessments and Hackathon Readiness scores.

---

## 7. Performance, Caching & Deployment Architecture

### 7.1 Zero-Millisecond Client Cache (`src/lib/clientCache.ts`)
* In-memory singleton cache holding user profile, active roadmaps, and quiz lists.
* Stale-While-Revalidate (SWR) mechanism with a 60-second freshness TTL.
* Eliminates network roundtrips during tab switching (`Home` ⇄ `Learn` ⇄ `Quizzes` ⇄ `Hackathons`).

### 7.2 Vercel & Serverless Deployment Readiness
* Dynamic SQLite configuration: Automatically mirrors `prisma/dev.db` to `/tmp/dev.db` on serverless cold starts.
* Preload module (`preload.js`) ensuring write access on ephemeral environments.
* `vercel.json` optimized with file tracing and security headers:
  * Zero SSO access restrictions.
  * Publicly accessible production endpoints.

---

## 8. Complete Route Directory

| Route Path | Type | Purpose / Description |
| :--- | :--- | :--- |
| `/` | Landing / Redirect | Smart redirection based on active session token |
| `/login` | Public Page | Dual Auth (Firebase Google Popup + Email/Password + Demo accounts) |
| `/onboarding/*` | Guided Flow | 5-step engineering academic and skill profiling |
| `/dashboard` | Protected Page | Adaptive milestone hub, roadmaps, and progress metrics |
| `/learn` | Protected Page | Course explorer and enrolled topic directory |
| `/learn/[id]` | Protected Page | Topic lecture room with notes, video player, and PDF export |
| `/quizzes` | Protected Page | Competency practice quizzes directory with Hackathon banner |
| `/quizzes/[id]` | Protected Page | 30-question adaptive assessment runner with timer |
| `/quizzes/[id]/result` | Protected Page | Detailed quiz scorecard, explanations, and review |
| `/hackathon-readiness` | Protected Page | Hackathon tech tracks, 48h roadmaps, and 8-question scenario check |
| `/competencies` | Protected Page | Competency gap radar and proficiency status analytics |
| `/assistant` | Protected Page | Embedded AI engineering tutor and LaTeX equation assistant |
| `/profile` | Protected Page | Profile editor, avatar display, and goal configuration |
| `/admin/dashboard` | Admin Only | Cohort intelligence overview and institutional stats |
| `/admin/learners` | Admin Only | Student roster and competency audit trails |
| `/admin/materials` | Admin Only | Curriculum upload and lecture material management |
| `/admin/generator` | Admin Only | AI-powered MCQ generation pipeline |
| `/admin/quizzes` | Admin Only | Quiz publishing and quality assurance portal |

---

## 9. Future Roadmap & Milestones (LearnFlow 3.0)

1. **Collaborative Hackathon Team Rooms**: Live WebRTC audio/video and shared Monaco code editor for 48-hour team sprints.
2. **Automated Code Execution Sandbox**: In-browser code runner using WebAssembly / Judge0 for automated unit test verification in DSA and Python.
3. **AI Voice Mock Technical Interviewer**: Real-time conversational audio agent conducting behavioral and system design interview simulations.
4. **Blockchain Credential Verification**: Verifiable completion certificates minted as soulbound NFTs on Polygon for tamper-proof resume verification.

---

*Document finalized and synchronized with repository codebase. Version 2.0.0.*
