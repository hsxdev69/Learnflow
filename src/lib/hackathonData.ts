export interface HackathonSkillGroup {
  category: string;
  skills: {
    name: string;
    importance: "Essential" | "Recommended" | "Bonus";
    description: string;
  }[];
}

export interface HackathonQuestion {
  id: string;
  question: string;
  scenario?: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  skillArea: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface HackathonTrack {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  badgeColor: string;
  gradient: string;
  iconName: string;
  estimatedMinutes: number;
  description: string;
  recommendedCourseId: string;
  recommendedCourseName: string;
  typicalProblemStatements: string[];
  fastTrackRoadmap: {
    hours: string;
    action: string;
    description: string;
  }[];
  skillRequirements: HackathonSkillGroup[];
  questions: HackathonQuestion[];
}

export const HACKATHON_TRACKS: HackathonTrack[] = [
  {
    id: "ai-ml",
    title: "AI, Machine Learning & GenAI",
    subtitle: "RAG Pipelines, LLMs, Computer Vision & Intelligent Agents",
    tag: "Highest In-Demand",
    badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
    gradient: "from-purple-600 to-indigo-600",
    iconName: "BrainCircuit",
    estimatedMinutes: 12,
    description:
      "Rapidly build working prototypes utilizing LLM APIs, retrieval-augmented generation (RAG), vector embeddings, agentic workflows, or computer vision for complex real-world challenges.",
    recommendedCourseId: "course_ml",
    recommendedCourseName: "Machine Learning & AI",
    typicalProblemStatements: [
      "Multi-modal Diagnostic & Triage Assistant for rural healthcare",
      "Real-time Automated Legal/Policy Document Analyzer using RAG",
      "Autonomous Multi-Agent System for Disaster Resource Dispatch",
      "Low-Latency Edge Vision for Smart Agriculture defect classification",
    ],
    fastTrackRoadmap: [
      {
        hours: "Hour 0 - 6",
        action: "Model Selection & Architecture",
        description: "Choose between Hosted API (Gemini/OpenAI) or Small Local Weights (Ollama/HuggingFace); test latency & tokens.",
      },
      {
        hours: "Hour 6 - 18",
        action: "Vector DB & Ingestion Pipeline",
        description: "Chunk datasets, generate embeddings, index in ChromaDB/Pinecone, and verify search precision.",
      },
      {
        hours: "Hour 18 - 32",
        action: "Backend Serving & Streaming API",
        description: "Wrap LLM in FastAPI/Next.js routes with streaming Server-Sent Events (SSE) for zero UI lag.",
      },
      {
        hours: "Hour 32 - 48",
        action: "Prompt Hardening & Interactive Demo",
        description: "Add guardrails against hallucinations, build polished UI demo state, and record backup screen recording.",
      },
    ],
    skillRequirements: [
      {
        category: "Programming & Frameworks",
        skills: [
          { name: "Python 3.10+", importance: "Essential", description: "Async I/O, Pydantic data schemas, typing" },
          { name: "FastAPI / Next.js API", importance: "Essential", description: "Serving endpoints with streaming responses" },
          { name: "PyTorch / Scikit-Learn", importance: "Recommended", description: "Baseline modeling, evaluation metrics" },
        ],
      },
      {
        category: "Generative AI & LLM Engineering",
        skills: [
          { name: "RAG Architecture", importance: "Essential", description: "Hybrid search, chunking strategies, reranking" },
          { name: "Vector Databases", importance: "Essential", description: "Pinecone, ChromaDB, PGVector similarity search" },
          { name: "Prompt Engineering & Guardrails", importance: "Essential", description: "Few-shot templates, structured JSON outputs" },
        ],
      },
      {
        category: "DevOps & Optimization",
        skills: [
          { name: "Quantization & Caching", importance: "Recommended", description: "GGML/GGUF, Redis semantic query caching" },
          { name: "Docker Containerization", importance: "Recommended", description: "Reproducible deployment across judge devices" },
        ],
      },
    ],
    questions: [
      {
        id: "ai_q1",
        question: "When building a RAG (Retrieval-Augmented Generation) system for domain-specific PDF documents during a hackathon, which chunking and retrieval approach minimizes hallucination most effectively?",
        options: [
          "Load the entire raw document into a single prompt without chunking",
          "Chunk with semantic boundary overlap, store embeddings in a vector DB, and perform similarity search with top-k reranking",
          "Use BM25 keyword matching only without vector embeddings",
          "Fine-tune an entire 70B parameter model from scratch on CPU",
        ],
        correctAnswer: 1,
        explanation: "Semantic chunking with sliding overlap preserves context between paragraphs, while top-k vector similarity search combined with cross-encoder reranking feeds the most relevant context snippets to the LLM, reducing hallucinations.",
        skillArea: "RAG Architecture & Chunking",
        difficulty: "Medium",
      },
      {
        id: "ai_q2",
        question: "Your hackathon demo requires an interactive LLM chat experience, but API responses take 6-10 seconds to generate completely. What is the standard industry pattern to eliminate perceived user latency?",
        options: [
          "Display a static loading spinner until the complete response is generated",
          "Implement Server-Sent Events (SSE) or WebSockets with token-by-token streaming to the UI",
          "Run a client-side polling interval every 500ms to fetch partial DB records",
          "Reduce the maximum output tokens to 10 tokens",
        ],
        correctAnswer: 1,
        explanation: "Streaming responses token-by-token via Server-Sent Events (SSE) or WebSockets delivers instant First-Token-Latency (<500ms), making the experience feel instantaneous while the full response continues to generate.",
        skillArea: "Real-time Streaming & API UX",
        difficulty: "Easy",
      },
      {
        id: "ai_q3",
        question: "To ensure your LLM output can be reliably parsed by downstream frontend visualization charts without JSON syntax errors, which technique is most robust?",
        options: [
          "Prompt the model saying 'Please respond in valid JSON only' and hope it complies",
          "Enforce JSON Schema / Structured Outputs mode (e.g., Pydantic schema validation or function calling)",
          "Use regex to extract numbers arbitrarily from freeform text",
          "Ask the user to manually reformat the text before charting",
        ],
        correctAnswer: 1,
        explanation: "Modern LLM APIs provide Structured Outputs with strict JSON Schema / tool calling guarantees, which constrain the decoding tokens to strictly adhere to the defined Pydantic/JSON schema.",
        skillArea: "Structured Outputs & Function Calling",
        difficulty: "Medium",
      },
      {
        id: "ai_q4",
        question: "In an image classification hackathon project with limited labeled training images (only 200 samples per class), which machine learning strategy yields the highest accuracy fastest?",
        options: [
          "Train a 50-layer Convolutional Neural Network from scratch with random weights",
          "Utilize Transfer Learning with a pre-trained backbone (e.g. ResNet/Vision Transformer) and fine-tune classifier heads",
          "Rely strictly on K-Means clustering with raw pixel intensity values",
          "Collect 100,000 more images manually before writing any code",
        ],
        correctAnswer: 1,
        explanation: "Transfer learning utilizes rich low- and mid-level feature representations learned from massive datasets (like ImageNet). Fine-tuning only the top layers on small custom datasets achieves high accuracy in minutes.",
        skillArea: "Transfer Learning & Vision",
        difficulty: "Medium",
      },
      {
        id: "ai_q5",
        question: "When evaluating an imbalanced classification model where detecting positive cases is critical (e.g. rare disease or fraud detection), which metric should your team optimize rather than raw accuracy?",
        options: [
          "Raw Accuracy percentage alone",
          "F1-Score, Precision-Recall AUC, and Recall / Sensitivity",
          "Mean Squared Error (MSE)",
          "R-Squared score",
        ],
        correctAnswer: 1,
        explanation: "On skewed datasets (e.g. 99% negative, 1% positive), a naive model predicting all negatives achieves 99% accuracy but fails completely. Recall, Precision, and F1-Score measure performance on the crucial minority class.",
        skillArea: "Model Evaluation & Metrics",
        difficulty: "Easy",
      },
      {
        id: "ai_q6",
        question: "What is the primary benefit of Semantic Caching (e.g., using GPTCache or Redis Vector similarity) in a hackathon demo?",
        options: [
          "It improves model weights automatically",
          "It instantly returns cached responses for semantically similar queries, saving API cost and reducing response time to <10ms",
          "It replaces the vector database entirely",
          "It automatically translates text into all languages",
        ],
        correctAnswer: 1,
        explanation: "Semantic caching checks vector distance between new questions and previous queries. If cosine similarity is above a threshold (e.g. 0.95), it serves the answer from cache in milliseconds without re-invoking the LLM API.",
        skillArea: "Semantic Caching & Optimization",
        difficulty: "Hard",
      },
      {
        id: "ai_q7",
        question: "In an Autonomous AI Agent workflow using LangGraph or CrewAI, what mechanism allows an agent to recover when a tool call fails or returns an unexpected error?",
        options: [
          "Terminate the process and prompt the user to start over",
          "Feed the tool error message back into the model's scratchpad for self-correction and retry with alternate arguments",
          "Ignore the error and output an empty string",
          "Switch to a linear while-true loop without exit condition",
        ],
        correctAnswer: 1,
        explanation: "Agentic reflection patterns pass execution traces and error feedback back into the context window, prompting the agent to reflect, adjust its parameters, or select a fallback tool.",
        skillArea: "Agentic Workflows & Tool Error Handling",
        difficulty: "Hard",
      },
      {
        id: "ai_q8",
        question: "Which vector index type provides the fastest approximate nearest neighbor (ANN) retrieval speed during high-throughput queries with slight trade-off in exact recall?",
        options: [
          "Flat / Exact brute-force Euclidean search",
          "HNSW (Hierarchical Navigable Small World)",
          "Single linked list traversal",
          "B-Tree single column index",
        ],
        correctAnswer: 1,
        explanation: "HNSW builds multi-layered graphs for logarithmic search time complexity, making it the industry gold-standard for fast ANN retrieval in production vector databases.",
        skillArea: "Vector Indexing & HNSW",
        difficulty: "Hard",
      },
    ],
  },
  {
    id: "fullstack-web",
    title: "Full-Stack Web Development & SaaS",
    subtitle: "React / Next.js, Node.js, REST & GraphQL APIs, Databases & Realtime Sync",
    tag: "Most Popular Track",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    gradient: "from-blue-600 to-cyan-600",
    iconName: "Globe",
    estimatedMinutes: 12,
    description:
      "Design, build, and deploy high-speed web applications with responsive modern UIs, robust backend services, secure authentication, database persistence, and clean UX.",
    recommendedCourseId: "course_web_dev",
    recommendedCourseName: "Web Development",
    typicalProblemStatements: [
      "Collaborative Real-Time Workspace for Remote Distributed Teams",
      "Crowdsourced Disaster Relief Coordination Platform with Live Maps",
      "FinTech Micro-Lending & Smart Escrow Marketplace with Verification",
      "Interactive Learning & Automated Peer Code Review Hub",
    ],
    fastTrackRoadmap: [
      {
        hours: "Hour 0 - 4",
        action: "Schema & Scaffold Boilerplate",
        description: "Set up Next.js 14 App Router, Tailwind CSS, Prisma ORM, and database connection.",
      },
      {
        hours: "Hour 4 - 14",
        action: "Core CRUD APIs & Auth",
        description: "Implement authentication (OAuth / JWT), core REST/Server Actions, and data models.",
      },
      {
        hours: "Hour 14 - 28",
        action: "Interactive UI & Real-Time Sync",
        description: "Build reactive components, optimistic UI updates, form validations, and live WebSocket/polling feeds.",
      },
      {
        hours: "Hour 28 - 48",
        action: "Production Deployment & Polish",
        description: "Deploy to Vercel/Render, seed realistic mock demo data, add keyboard shortcuts and celebratory micro-interactions.",
      },
    ],
    skillRequirements: [
      {
        category: "Frontend & UI Engineering",
        skills: [
          { name: "React 18+ / Next.js App Router", importance: "Essential", description: "Server vs Client Components, Suspense, streaming" },
          { name: "Tailwind CSS & Component Libraries", importance: "Essential", description: "Responsive layouts, Lucide icons, dark mode" },
          { name: "State Management & Form Handling", importance: "Essential", description: "Zustand / React Hook Form / Zod schemas" },
        ],
      },
      {
        category: "Backend & Architecture",
        skills: [
          { name: "RESTful APIs / Server Actions", importance: "Essential", description: "Validation, HTTP status codes, error handling" },
          { name: "PostgreSQL / SQLite / MongoDB", importance: "Essential", description: "Relations, indexing, transaction rollbacks" },
          { name: "Prisma / Drizzle ORM", importance: "Essential", description: "Migrations, typed queries, connection pooling" },
        ],
      },
      {
        category: "Security & Production Readiness",
        skills: [
          { name: "Auth & Session Management", importance: "Essential", description: "HttpOnly cookies, JWT verification, CSRF defense" },
          { name: "CI/CD & Cloud Deployment", importance: "Recommended", description: "Vercel, Docker, environment variable security" },
        ],
      },
    ],
    questions: [
      {
        id: "web_q1",
        question: "In Next.js 14 App Router, what is the key architectural difference between a React Server Component (RSC) and a Client Component ('use client')?",
        options: [
          "Server Components can use useState and useEffect, while Client Components cannot",
          "Server Components execute exclusively on the server with zero client JS bundle impact; Client Components hydrate on the browser and enable user interactivity",
          "Client Components cannot fetch data directly from databases",
          "Server Components only work with HTML table tags",
        ],
        correctAnswer: 1,
        explanation: "React Server Components execute on the server, accessing databases and private environment variables without shipping JavaScript to the browser. Client components are reserved for interactive features like event listeners and hooks.",
        skillArea: "React Server vs Client Components",
        difficulty: "Medium",
      },
      {
        id: "web_q2",
        question: "To prevent SQL Injection vulnerabilities in a hackathon web application, what is the best practice when executing database queries?",
        options: [
          "Concatenate user input strings directly into raw SQL statements",
          "Use parameterized queries or an Object-Relational Mapper (ORM) like Prisma / Drizzle",
          "Encode user input into Base64 format before query concatenation",
          "Rely on client-side regex input validation only",
        ],
        correctAnswer: 1,
        explanation: "Parameterized queries and ORMs separate SQL code from user-supplied parameters, ensuring inputs are treated strictly as data literals and cannot alter the query structure.",
        skillArea: "Database Security & SQL Injection Prevention",
        difficulty: "Easy",
      },
      {
        id: "web_q3",
        question: "Your hackathon web app is displaying a list of 5,000 items with slow scroll performance and lag. What is the most effective optimization technique to implement in under 15 minutes?",
        options: [
          "Render all 5,000 DOM elements inside a nested div",
          "Implement List Virtualization (e.g. TanStack Virtual / react-window) to render only items currently inside the visible viewport",
          "Convert all text into static bitmap images",
          "Disable all CSS styling across the application",
        ],
        correctAnswer: 1,
        explanation: "DOM virtualization renders only the small slice of items visible on screen (typically 10-20 nodes), drastically reducing memory usage and maintaining 60fps scrolling even with 100,000 items.",
        skillArea: "Frontend Performance & Virtualization",
        difficulty: "Medium",
      },
      {
        id: "web_q4",
        question: "Where should sensitive authentication tokens (like session tokens or refresh tokens) be stored to prevent Cross-Site Scripting (XSS) token theft?",
        options: [
          "window.localStorage",
          "HttpOnly, Secure, SameSite cookies",
          "HTML data attributes on the body element",
          "Global window JavaScript variable",
        ],
        correctAnswer: 1,
        explanation: "HttpOnly cookies cannot be accessed or read by JavaScript running in the browser, protecting user sessions even if an attacker manages to execute an XSS payload.",
        skillArea: "Authentication & Web Security",
        difficulty: "Medium",
      },
      {
        id: "web_q5",
        question: "When building a collaborative live feature (e.g. live whiteboard or concurrent editing) during a hackathon, which communication technology provides the lowest full-duplex latency?",
        options: [
          "HTTP Polling with setInterval every 10 seconds",
          "WebSockets or WebRTC Data Channels",
          "Sending periodic emails between users",
          "Reloading the entire browser tab on button click",
        ],
        correctAnswer: 1,
        explanation: "WebSockets establish a persistent, bidirectional TCP connection enabling sub-10ms data frames without the overhead of repeated HTTP handshake headers.",
        skillArea: "Real-Time Protocols & WebSockets",
        difficulty: "Easy",
      },
      {
        id: "web_q6",
        question: "What is Optimistic UI updating, and why is it recommended for hackathon project presentations?",
        options: [
          "Showing motivational quotes when API calls fail",
          "Immediately updating the user interface locally as if the mutation succeeded before the server response returns, making the app feel instantaneously fast",
          "Removing all backend verification",
          "Only testing the application in ideal network conditions",
        ],
        correctAnswer: 1,
        explanation: "Optimistic UI renders the expected success state immediately. If the server request later fails, the state rolls back with an alert. This creates a hyper-responsive, polished feel for judges.",
        skillArea: "UX Polish & Optimistic UI",
        difficulty: "Medium",
      },
      {
        id: "web_q7",
        question: "To prevent race conditions when two users attempt to purchase the last available ticket or reserve an asset simultaneously, which database technique should you employ?",
        options: [
          "Run two separate SELECT queries without a lock",
          "Use a Database Transaction with Row-Level Locking (SELECT FOR UPDATE) or Atomic Conditional Updates",
          "Sleep for 500ms in JavaScript between checks",
          "Ignore concurrency since hackathons are small",
        ],
        correctAnswer: 1,
        explanation: "ACID transactions with row-level locks or atomic conditional updates (`UPDATE inventory SET stock = stock - 1 WHERE id = 1 AND stock > 0`) guarantee isolation and prevent double-spending.",
        skillArea: "Database Concurrency & ACID Transactions",
        difficulty: "Hard",
      },
      {
        id: "web_q8",
        question: "What does CORS (Cross-Origin Resource Sharing) protect, and how do you resolve a 'Blocked by CORS Policy' error when your Next.js frontend calls your external backend API?",
        options: [
          "It protects backend databases from crashing; disable HTTPS to fix it",
          "It is a browser security mechanism that restricts cross-origin HTTP requests; configure the backend server to return appropriate 'Access-Control-Allow-Origin' headers matching the frontend domain",
          "It encrypts passwords automatically",
          "Delete the frontend API call",
        ],
        correctAnswer: 1,
        explanation: "CORS is enforced by browsers to protect users from unauthorized cross-site requests. The backend server must explicitly allow the requesting origin via `Access-Control-Allow-Origin` headers.",
        skillArea: "CORS & Cross-Origin Networking",
        difficulty: "Medium",
      },
    ],
  },
  {
    id: "mobile-dev",
    title: "Mobile App Development",
    subtitle: "React Native / Expo, Flutter, Offline Storage, Device Hardware & Push Notifications",
    tag: "High Impact",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    gradient: "from-emerald-600 to-teal-600",
    iconName: "Smartphone",
    estimatedMinutes: 12,
    description:
      "Craft cross-platform native iOS & Android applications with buttery 60fps animations, offline-first data caching, camera/GPS hardware integration, and push messaging.",
    recommendedCourseId: "course_web_dev",
    recommendedCourseName: "Web & Mobile Foundations",
    typicalProblemStatements: [
      "Emergency Offline SOS & Mesh Networking App for First Responders",
      "AR-based Campus Navigation and Accessibility Assistant",
      "Local Farmer Produce Marketplace with Geo-location & Voice Search",
      "Personal Health & Daily Habit Tracking with Gamified Widgets",
    ],
    fastTrackRoadmap: [
      {
        hours: "Hour 0 - 4",
        action: "Expo / Flutter CLI Scaffold",
        description: "Initialize with Expo SDK / Flutter, set up navigation stack, and test on physical devices via Expo Go.",
      },
      {
        hours: "Hour 4 - 16",
        action: "Core Screens & Device Hardware",
        description: "Integrate camera, GPS location, and biometric auth; build primary interactive workflows.",
      },
      {
        hours: "Hour 16 - 32",
        action: "Offline-First Sync & Storage",
        description: "Configure local SQLite/MMKV cache; queue network operations when device is disconnected.",
      },
      {
        hours: "Hour 32 - 48",
        action: "Demo Video & Touch Polish",
        description: "Fine-tune haptic feedback, gestures, splash screen branding, and record crisp phone screen demo.",
      },
    ],
    skillRequirements: [
      {
        category: "Mobile Frameworks",
        skills: [
          { name: "React Native / Expo", importance: "Essential", description: "Expo Router, NativeWind, Safe Area contexts" },
          { name: "Flutter & Dart", importance: "Recommended", description: "Widget trees, stateful lifecycles, Bloc/Provider" },
          { name: "Navigation Architecture", importance: "Essential", description: "Tab bars, modal sheets, deep linking" },
        ],
      },
      {
        category: "Hardware & Offline Capabilities",
        skills: [
          { name: "Offline-First Storage", importance: "Essential", description: "MMKV, WatermelonDB, SQLite, AsyncStorage" },
          { name: "Sensors & APIs", importance: "Recommended", description: "Geolocation, Camera, Accelerometer, Bluetooth" },
          { name: "Push Notifications", importance: "Recommended", description: "Expo Notifications, Firebase Cloud Messaging" },
        ],
      },
    ],
    questions: [
      {
        id: "mob_q1",
        question: "When presenting a mobile hackathon project in an exhibition hall where Wi-Fi is unstable or disconnected, which architecture ensures your demo never crashes?",
        options: [
          "Depend exclusively on live server requests without timeouts",
          "Offline-First Architecture with local persistence (SQLite / MMKV) and background sync queue",
          "Hardcode a single mock string directly inside the render loop",
          "Require judges to tether to a personal hotspot",
        ],
        correctAnswer: 1,
        explanation: "Offline-first architectures store data locally first and sync changes asynchronously in the background, guaranteeing the app functions smoothly even in zero-connectivity environments.",
        skillArea: "Offline-First Mobile Architecture",
        difficulty: "Medium",
      },
      {
        id: "mob_q2",
        question: "In React Native, which key-value storage solution provides near-instantaneous synchronous reads/writes by utilizing direct C++ memory-mapped files instead of asynchronous bridge serialization?",
        options: [
          "AsyncStorage",
          "react-native-mmkv",
          "DocumentDirectory file reading",
          "HTML LocalStorage inside a hidden WebView",
        ],
        correctAnswer: 1,
        explanation: "MMKV uses C++ JSI (JavaScript Interface) and memory-mapped files (mmap) for synchronous reads and writes up to 30x faster than legacy AsyncStorage.",
        skillArea: "High-Performance Mobile Storage",
        difficulty: "Medium",
      },
      {
        id: "mob_q3",
        question: "To prevent UI jank and maintain 60-120fps animations when a user drags or gestures on screen in React Native, which library runs animation calculations directly on the native UI thread?",
        options: [
          "CSS Keyframes inside React Native",
          "React Native Reanimated 2/3 and Gesture Handler",
          "Standard window.requestAnimationFrame in JavaScript",
          "setTimeout loops with 16ms delays",
        ],
        correctAnswer: 1,
        explanation: "React Native Reanimated executes animation 'worklets' directly on the native UI thread, preventing frame drops even when the JavaScript thread is busy parsing data.",
        skillArea: "Native Animations & 60fps Gesture Handling",
        difficulty: "Hard",
      },
      {
        id: "mob_q4",
        question: "When requesting high-precision GPS Geolocation permissions on iOS and Android, what is the best UX practice?",
        options: [
          "Immediately prompt for system permissions on the very first frame before showing any UI",
          "Provide an in-app explanatory screen explaining why location is needed for the feature, then trigger the OS permission dialog",
          "Bypass permissions by reading the IP address",
          "Throw an error if the user does not grant background tracking",
        ],
        correctAnswer: 1,
        explanation: "Contextual permission requests that explain the user value before triggering the system modal drastically increase user opt-in rates and pass app store guidelines.",
        skillArea: "Mobile Permissions & Hardware UX",
        difficulty: "Easy",
      },
      {
        id: "mob_q5",
        question: "What is the function of the SafeAreaView / SafeAreaProvider component in modern mobile apps?",
        options: [
          "It encrypts SQLite databases",
          "It automatically pads content to prevent UI elements from being obscured by notches, dynamic islands, home indicator bars, and rounded device corners",
          "It protects mobile apps against reverse engineering",
          "It restricts app usage to safe Wi-Fi networks",
        ],
        correctAnswer: 1,
        explanation: "SafeAreaView accounts for physical device contours (camera notches, status bars, home indicators), ensuring buttons and text remain fully visible and clickable.",
        skillArea: "Responsive Mobile Layouts & Safe Areas",
        difficulty: "Easy",
      },
      {
        id: "mob_q6",
        question: "What is Deep Linking in mobile applications, and how is it used during hackathon product demonstrations?",
        options: [
          "Linking directly to the deep web",
          "Allowing URL schemes or universal links (e.g. app://verify?id=123) to open specific screens and pre-fill state directly inside the mobile app",
          "Connecting to database servers over SSH",
          "Downloading files from cloud storage",
        ],
        correctAnswer: 1,
        explanation: "Deep links allow testing, QR codes, and notifications to open exact destination screens directly with parameters, streamlining live demo transitions.",
        skillArea: "Deep Linking & App Navigation",
        difficulty: "Medium",
      },
      {
        id: "mob_q7",
        question: "When rendering a feed of 1,000 image posts in React Native, which component should be used instead of a ScrollView with .map()?",
        options: [
          "A vertical View with overflow: scroll",
          "FlatList or FlashList with recycled view cells and windowSize tuning",
          "An HTML iframe containing web images",
          "A series of modal alerts",
        ],
        correctAnswer: 1,
        explanation: "FlatList and FlashList recycle off-screen views and unmount inactive components, avoiding out-of-memory (OOM) crashes on mobile devices.",
        skillArea: "Mobile List Rendering & Memory Management",
        difficulty: "Easy",
      },
      {
        id: "mob_q8",
        question: "How should long-running background tasks (such as periodic sensor data logging or geofence tracking) be handled on modern Android and iOS?",
        options: [
          "Keep an infinite while-loop running on the main UI thread",
          "Use OS background task managers (such as WorkManager on Android, BackgroundTasks on iOS, or Expo TaskManager)",
          "Disable phone sleep mode in user settings",
          "Run a continuous WebSocket connection in the background forever",
        ],
        correctAnswer: 1,
        explanation: "Mobile operating systems aggressively terminate inactive background apps to conserve battery. OS background task schedulers allow controlled execution windows.",
        skillArea: "Background Execution & WorkManager",
        difficulty: "Hard",
      },
    ],
  },
  {
    id: "cloud-devops",
    title: "Cloud, DevOps & Scalable Backend",
    subtitle: "Docker Containers, CI/CD Pipelines, Microservices, Kubernetes & Cloud Architecture",
    tag: "High Scalability",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
    gradient: "from-amber-600 to-orange-600",
    iconName: "Cloud",
    estimatedMinutes: 12,
    description:
      "Architect resilient cloud infrastructure, containerize microservices, deploy automated CI/CD pipelines, configure caching layers, and maintain zero-downtime scalability.",
    recommendedCourseId: "course_cloud",
    recommendedCourseName: "Cloud Computing & DevOps",
    typicalProblemStatements: [
      "Auto-scaling Ticket Queuing Engine for High-Concurreny Surge Traffic",
      "Automated Multi-Cloud Deployment & Failover Sentinel",
      "Zero-Downtime Microservice Observability & Distributed Tracing Stack",
      "Serverless Event-Driven Video Transcoding & Distribution Pipeline",
    ],
    fastTrackRoadmap: [
      {
        hours: "Hour 0 - 6",
        action: "Containerization & Docker Compose",
        description: "Package database, cache, and backend services in multi-stage Dockerfiles with healthchecks.",
      },
      {
        hours: "Hour 6 - 18",
        action: "Cloud Infrastructure Setup",
        description: "Provision managed database (AWS RDS/Supabase), Redis cache, and reverse proxy (Nginx).",
      },
      {
        hours: "Hour 18 - 34",
        action: "CI/CD & Automated Deployment",
        description: "Configure GitHub Actions to run tests, build Docker images, and deploy to cloud VMs / serverless.",
      },
      {
        hours: "Hour 34 - 48",
        action: "Load Testing & Monitoring Live Demo",
        description: "Benchmark using k6/Autocannon, display live Prometheus/Grafana graphs showing scaling to judges.",
      },
    ],
    skillRequirements: [
      {
        category: "Containers & Orchestration",
        skills: [
          { name: "Docker & Docker Compose", importance: "Essential", description: "Multi-stage builds, volumes, networks, non-root users" },
          { name: "Kubernetes (K8s) Basics", importance: "Recommended", description: "Pods, Deployments, Services, Ingress, ConfigMaps" },
        ],
      },
      {
        category: "CI/CD & Cloud Infrastructure",
        skills: [
          { name: "GitHub Actions / CI Pipelines", importance: "Essential", description: "Automated linting, testing, Docker image publishing" },
          { name: "AWS / GCP / Cloudflare", importance: "Essential", description: "S3, EC2/Cloud Run, Serverless Functions, Edge routing" },
          { name: "Redis Caching & Message Queues", importance: "Essential", description: "Pub/Sub, BullMQ, distributed locks, rate limiting" },
        ],
      },
    ],
    questions: [
      {
        id: "cloud_q1",
        question: "Why are Multi-Stage Docker builds strongly recommended when containerizing a production Node.js or Next.js service?",
        options: [
          "They make the build process 10 times slower",
          "They separate the build environment from the final runtime image, drastically reducing image size and excluding development dependencies and source code secrets",
          "They automatically configure Kubernetes clusters",
          "They allow running multiple operating systems inside one container",
        ],
        correctAnswer: 1,
        explanation: "Multi-stage builds compile assets in an ephemeral builder container and copy only the compiled artifacts into a lightweight production image (e.g. Alpine/Distroless), shrinking images from 1GB+ down to ~80MB.",
        skillArea: "Docker Optimization & Multi-Stage Builds",
        difficulty: "Medium",
      },
      {
        id: "cloud_q2",
        question: "During a hackathon live demo, your API server receives 10,000 requests per second. Which architectural layer protects your primary database from being overwhelmed?",
        options: [
          "Increasing the database CPU manually during the demo",
          "In-memory Caching layer (Redis / Memcached) with read-through caching and connection pooling",
          "Storing all queries in a text file on disk",
          "Restarting the server every 30 seconds",
        ],
        correctAnswer: 1,
        explanation: "In-memory caches (Redis) serve frequently read queries in sub-millisecond time directly from RAM, absorbing 90%+ of traffic before it reaches the relational database.",
        skillArea: "High-Throughput Caching & Redis",
        difficulty: "Easy",
      },
      {
        id: "cloud_q3",
        question: "In a Kubernetes deployment, what is the role of a Readiness Probe versus a Liveness Probe?",
        options: [
          "They are identical synonyms",
          "A Liveness Probe checks if the container is alive (restarts if failed); a Readiness Probe determines if the container is ready to accept incoming network traffic",
          "Readiness probes compile the code before execution",
          "Liveness probes only run once during pod creation",
        ],
        correctAnswer: 1,
        explanation: "Liveness probes restart hung containers; readiness probes ensure traffic is only routed to pods that have finished warming up caches and initializing database connections.",
        skillArea: "Kubernetes Health Checks & Orchestration",
        difficulty: "Hard",
      },
      {
        id: "cloud_q4",
        question: "How should production secrets (API keys, database passwords) be injected into CI/CD pipelines and cloud servers safely?",
        options: [
          "Commit them directly into git in a file named secrets.txt",
          "Use encrypted Secret Managers (GitHub Secrets, AWS Secrets Manager, HashiCorp Vault) and inject as runtime environment variables",
          "Hardcode them into frontend JavaScript client code",
          "Share them in public commit messages",
        ],
        correctAnswer: 1,
        explanation: "Secrets must never be stored in version control. Encrypted secret managers inject values into execution runners at runtime securely.",
        skillArea: "Cloud Security & Secrets Management",
        difficulty: "Easy",
      },
      {
        id: "cloud_q5",
        question: "What is the difference between Horizontal Scaling and Vertical Scaling?",
        options: [
          "Horizontal scaling means adding more machines/containers; Vertical scaling means upgrading the CPU/RAM of a single existing machine",
          "Horizontal scaling rotates the server physically on its side",
          "Vertical scaling is always free while horizontal scaling is always paid",
          "Horizontal scaling is only possible on Windows servers",
        ],
        correctAnswer: 0,
        explanation: "Horizontal scaling scales out by adding more node instances behind a load balancer, providing high availability and fault tolerance beyond the hardware limits of a single machine.",
        skillArea: "Scalability Architecture Concepts",
        difficulty: "Easy",
      },
      {
        id: "cloud_q6",
        question: "What is an Ingress Controller in modern cloud infrastructure?",
        options: [
          "A tool that checks developer git commits",
          "A specialized reverse proxy and load balancer that manages external HTTP/HTTPS traffic routing into internal cluster services",
          "A database backup automation tool",
          "A client-side browser plugin",
        ],
        correctAnswer: 1,
        explanation: "Ingress controllers (e.g. Nginx, Traefik) provide SSL termination, host-based routing, path rewrites, and load distribution for services running inside a cluster.",
        skillArea: "Ingress & Reverse Proxy Architecture",
        difficulty: "Medium",
      },
      {
        id: "cloud_q7",
        question: "Which database connection pool issue commonly causes 'FATAL: remaining connection slots are reserved for non-replication superuser connections' in serverless environments?",
        options: [
          "Too few users accessing the app",
          "Serverless functions spinning up hundreds of concurrent ephemeral containers, each opening independent database connections without a centralized connection pooler (like PgBouncer / Prisma Accelerate)",
          "The database password expired",
          "The network cable was unplugged",
        ],
        correctAnswer: 1,
        explanation: "Each serverless function instance maintains its own connection pool. High concurrency exhausts Postgres connection limits quickly without an intermediate connection pooler like PgBouncer.",
        skillArea: "Serverless Database Connection Pooling",
        difficulty: "Hard",
      },
      {
        id: "cloud_q8",
        question: "What is the primary benefit of Infrastructure as Code (IaC) tools like Terraform?",
        options: [
          "Writing code faster in Python",
          "Defining and version-controlling cloud infrastructure in declarative configuration files, enabling reproducible, automated environments",
          "Replacing Docker containers completely",
          "Eliminating the need for cloud providers",
        ],
        correctAnswer: 1,
        explanation: "IaC ensures environments can be spun up, modified, and torn down reliably with zero manual clicking in cloud web consoles.",
        skillArea: "Infrastructure as Code (Terraform)",
        difficulty: "Medium",
      },
    ],
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity & Ethical Defense",
    subtitle: "OWASP Top 10, Zero-Trust Architecture, Cryptography & Secure API Hardening",
    tag: "Security Track",
    badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
    gradient: "from-rose-600 to-red-600",
    iconName: "ShieldCheck",
    estimatedMinutes: 12,
    description:
      "Identify critical vulnerabilities, patch OWASP Top 10 vectors, implement zero-trust access control, harden cryptographic standards, and defend applications under adversarial attacks.",
    recommendedCourseId: "course_cyber",
    recommendedCourseName: "Cyber Security",
    typicalProblemStatements: [
      "Decentralized Zero-Knowledge Identity Verification without PII Leakage",
      "Automated Dynamic API Vulnerability Scanner & Exploit Mitigation Agent",
      "Secure Encrypted Health Record Transfer with Audit Immutability",
      "Real-Time Phishing & Credential Stuffing Defense Gateway",
    ],
    fastTrackRoadmap: [
      {
        hours: "Hour 0 - 6",
        action: "Threat Modeling & Security Perimeter",
        description: "Map attack surfaces, define trust boundaries, and configure strict Content Security Policies (CSP).",
      },
      {
        hours: "Hour 6 - 20",
        action: "Zero-Trust Auth & RBAC",
        description: "Implement fine-grained Role-Based Access Control, cryptographically signed tokens, and rate limits.",
      },
      {
        hours: "Hour 20 - 36",
        action: "Penetration Testing & Hardening",
        description: "Run automated static/dynamic scans (OWASP ZAP), patch XSS/CSRF/SSRF and SQLi vectors.",
      },
      {
        hours: "Hour 36 - 48",
        action: "Live Security Audit Demo",
        description: "Prepare an ethical attack-defense demonstration showing attempted exploits successfully thwarted.",
      },
    ],
    skillRequirements: [
      {
        category: "Web & API Security",
        skills: [
          { name: "OWASP Top 10 Mitigation", importance: "Essential", description: "XSS, SQLi, SSRF, Broken Access Control, IDOR" },
          { name: "Rate Limiting & DDoS Defense", importance: "Essential", description: "Token bucket algorithms, IP blocking, CAPTCHA" },
          { name: "Content Security Policy (CSP)", importance: "Recommended", description: "Strict script-src, frame-ancestors, nonce hashes" },
        ],
      },
      {
        category: "Cryptography & Protocols",
        skills: [
          { name: "Hashing & Encryption", importance: "Essential", description: "bcrypt/argon2id for passwords, AES-256-GCM, TLS 1.3" },
          { name: "Zero-Knowledge / Public-Key Crypto", importance: "Bonus", description: "Ed25519 signatures, asymmetric key exchanges" },
        ],
      },
    ],
    questions: [
      {
        id: "sec_q1",
        question: "What is Insecure Direct Object Reference (IDOR), and how do you protect against it?",
        options: [
          "Using object-oriented programming in JavaScript",
          "A vulnerability where a user accesses unauthorized records by simply modifying an ID parameter (e.g. /api/users/102); protect by enforcing server-side authorization checks verifying the requesting user owns the requested resource",
          "A CSS styling bug on mobile screens",
          "A slow SQL database query",
        ],
        correctAnswer: 1,
        explanation: "IDOR occurs when access control is missing. The server must verify whether the authenticated user has explicit permission to read or modify the requested resource ID.",
        skillArea: "Broken Access Control & IDOR",
        difficulty: "Medium",
      },
      {
        id: "sec_q2",
        question: "Why should passwords never be hashed using fast hashing algorithms like MD5 or SHA-256?",
        options: [
          "They take too much disk storage space",
          "Modern GPUs can calculate billions of MD5/SHA-256 hashes per second, making offline brute-force and rainbow table attacks trivial; use slow, memory-hard algorithms like Argon2id or bcrypt instead",
          "They cannot hash passwords longer than 5 characters",
          "They require an internet connection to compute",
        ],
        correctAnswer: 1,
        explanation: "Argon2id and bcrypt are deliberately computationally intensive and memory-hard with configurable work factors, thwarting GPU/ASIC parallel brute-force attacks.",
        skillArea: "Password Hashing & Cryptographic Security",
        difficulty: "Easy",
      },
      {
        id: "sec_q3",
        question: "What is Server-Side Request Forgery (SSRF), which frequently affects hackathon projects that fetch user-submitted URLs (e.g. link preview or web scraper tools)?",
        options: [
          "A browser error when rendering SVG images",
          "An attacker tricks the backend server into sending HTTP requests to internal, private network endpoints (such as http://169.254.169.254 for cloud metadata credentials or internal databases)",
          "A user entering an incorrect password three times",
          "A broken SSL certificate",
        ],
        correctAnswer: 1,
        explanation: "SSRF exploits the server's network trust to scan internal private IPs (like AWS metadata endpoints). Mitigate by validating URLs against a strict whitelist and blocking RFC 1918 private subnets.",
        skillArea: "Server-Side Request Forgery (SSRF)",
        difficulty: "Hard",
      },
      {
        id: "sec_q4",
        question: "What does the 'SameSite=Strict' attribute on a session cookie defend against?",
        options: [
          "Cross-Site Scripting (XSS)",
          "Cross-Site Request Forgery (CSRF)",
          "SQL Injection",
          "DNS Spoofing",
        ],
        correctAnswer: 1,
        explanation: "SameSite=Strict prevents the browser from sending the cookie with any cross-site request (e.g. links from external sites), neutralizing CSRF exploits.",
        skillArea: "CSRF & Cookie Security Attributes",
        difficulty: "Medium",
      },
      {
        id: "sec_q5",
        question: "What is the core principle of Zero-Trust Security Architecture?",
        options: [
          "Trust any device connected to the corporate internal office Wi-Fi",
          "'Never Trust, Always Verify' — every user, device, and service request must be continuously authenticated and authorized regardless of network perimeter location",
          "Eliminate all firewalls to improve speed",
          "Rely entirely on username and password without multi-factor authentication",
        ],
        correctAnswer: 1,
        explanation: "Zero-Trust treats the internal network as hostile. It enforces strict least-privilege access, mutual TLS, and continuous validation at every microservice boundary.",
        skillArea: "Zero-Trust Architecture",
        difficulty: "Easy",
      },
      {
        id: "sec_q6",
        question: "To prevent Stored Cross-Site Scripting (XSS) when displaying user-generated rich text or comments, what must the application do?",
        options: [
          "Store the raw HTML directly without any sanitization",
          "Sanitize and encode all untrusted user inputs using a battle-tested library (e.g., DOMPurify) before rendering, and set strict Content Security Policy headers",
          "Only allow users to submit plain text under 10 characters",
          "Disable JavaScript completely in the developer's browser",
        ],
        correctAnswer: 1,
        explanation: "DOMPurify strips malicious JavaScript payloads and event handlers from HTML. Combined with strict CSP headers, it neutralizes XSS execution.",
        skillArea: "Cross-Site Scripting (XSS) Mitigation",
        difficulty: "Medium",
      },
      {
        id: "sec_q7",
        question: "What is the security implication of exposing detailed database stack traces in production API 500 error responses?",
        options: [
          "It helps legitimate users fix their computers",
          "Information Disclosure — it reveals database table names, SQL query structure, library versions, and file paths to potential attackers",
          "It increases API latency by 100x",
          "It automatically encrypts user data",
        ],
        correctAnswer: 1,
        explanation: "Detailed error traces provide attackers with internal blueprints of your application architecture. In production, return generic error messages while logging detailed stack traces securely on the server.",
        skillArea: "Information Disclosure & Error Hardening",
        difficulty: "Easy",
      },
      {
        id: "sec_q8",
        question: "Which cryptographic primitive ensures both data confidentiality AND integrity/authenticity simultaneously?",
        options: [
          "Base64 Encoding",
          "Authenticated Encryption with Associated Data (AEAD), such as AES-256-GCM or ChaCha20-Poly1305",
          "MD5 checksum",
          "Rot13 cipher",
        ],
        correctAnswer: 1,
        explanation: "AEAD ciphers (like AES-GCM) provide ciphertext encryption while producing an authentication tag that detects any tampering or bit-flipping attempts.",
        skillArea: "Authenticated Encryption (AEAD)",
        difficulty: "Hard",
      },
    ],
  },
  {
    id: "web3-blockchain",
    title: "Web3, Blockchain & Decentralized Apps",
    subtitle: "Solidity Smart Contracts, EVM, Wallet Integration, IPFS & Gas Optimization",
    tag: "Emerging Tech",
    badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
    gradient: "from-indigo-600 to-violet-600",
    iconName: "Coins",
    estimatedMinutes: 12,
    description:
      "Design tamper-proof smart contracts, build decentralized frontends with viem/wagmi, implement decentralized storage (IPFS/Arweave), and audit contracts against common exploits.",
    recommendedCourseId: "course_web_dev",
    recommendedCourseName: "Web Development & Web3 Foundations",
    typicalProblemStatements: [
      "Transparent Public Charity Donation Tracker with Proof of Reserves",
      "Decentralized Academic Credential & Certificate Verification Network",
      "Fractional Real-World Asset Tokenization & Governance DAO",
      "Cross-Chain Micropayments Protocol for Freelance Work",
    ],
    fastTrackRoadmap: [
      {
        hours: "Hour 0 - 6",
        action: "Contract Specification & Scaffold",
        description: "Write Solidity contracts using OpenZeppelin standards; test locally with Foundry/Hardhat.",
      },
      {
        hours: "Hour 6 - 20",
        action: "Deployment to Testnet",
        description: "Deploy and verify contracts on Sepolia or Polygon Amoy testnet; configure block explorer links.",
      },
      {
        hours: "Hour 20 - 36",
        action: "Wallet Integration & DApp UI",
        description: "Integrate RainbowKit/Wagmi for wallet connections; build reactive transaction states with toast notifications.",
      },
      {
        hours: "Hour 36 - 48",
        action: "Security Audit & Pitch Demo",
        description: "Audit against reentrancy and integer underflow; showcase transparent live blockchain explorer transactions.",
      },
    ],
    skillRequirements: [
      {
        category: "Smart Contracts & Protocols",
        skills: [
          { name: "Solidity 0.8+", importance: "Essential", description: "Modifiers, events, gas optimization, ERC-20/ERC-721" },
          { name: "Foundry / Hardhat", importance: "Essential", description: "Fuzz testing, local node fork, deployment scripts" },
          { name: "Smart Contract Security", importance: "Essential", description: "ReentrancyGuard, Checks-Effects-Interactions pattern" },
        ],
      },
      {
        category: "DApp Frontend & Web3 Libraries",
        skills: [
          { name: "Viem / Wagmi / Ethers.js", importance: "Essential", description: "Wallet connection, contract reads, write simulation" },
          { name: "IPFS / Decentralized Storage", importance: "Recommended", description: "Pinata, Filecoin metadata persistence" },
        ],
      },
    ],
    questions: [
      {
        id: "w3_q1",
        question: "What vulnerability caused the infamous DAO hack in Ethereum history, and what standard programming pattern prevents it?",
        options: [
          "SQL injection in smart contracts; resolved with Prisma ORM",
          "Reentrancy Attack; prevented by the Checks-Effects-Interactions pattern or OpenZeppelin ReentrancyGuard",
          "A forgotten private key on GitHub",
          "CSS layout breaking in MetaMask",
        ],
        correctAnswer: 1,
        explanation: "Reentrancy occurs when an external call is made before internal balances are updated, allowing the caller to recursively withdraw funds. Updating state BEFORE external transfers (Checks-Effects-Interactions) neutralizes this.",
        skillArea: "Reentrancy Attacks & Contract Security",
        difficulty: "Hard",
      },
      {
        id: "w3_q2",
        question: "In Solidity 0.8.0 and above, what happens automatically when an arithmetic operation causes an integer overflow or underflow?",
        options: [
          "The transaction continues silently with wrapped values",
          "The EVM automatically reverts the transaction with an arithmetic error, eliminating the need for SafeMath",
          "The contract is permanently destroyed",
          "The gas fee is doubled",
        ],
        correctAnswer: 1,
        explanation: "Solidity 0.8.0 introduced built-in overflow and underflow checking, automatically reverting failing transactions unless explicitly wrapped in an 'unchecked' block for gas savings.",
        skillArea: "Solidity 0.8+ Arithmetic Safety",
        difficulty: "Medium",
      },
      {
        id: "w3_q3",
        question: "Why should large media files (like 4K video or high-res images) NOT be stored directly inside smart contract storage on Ethereum or Polygon?",
        options: [
          "Smart contracts can only store integers under 100",
          "On-chain storage is extremely expensive in gas fees (thousands of dollars per megabyte); store media off-chain on decentralized networks like IPFS or Arweave, storing only the immutable CID hash on-chain",
          "Blockchain nodes cannot connect to the internet",
          "Images get automatically converted to text",
        ],
        correctAnswer: 1,
        explanation: "Writing to EVM storage slots (SSTORE) costs 20,000 gas per 32 bytes. Decentralized storage like IPFS provides content-addressed storage (CID) at negligible cost.",
        skillArea: "Decentralized Storage & IPFS",
        difficulty: "Easy",
      },
      {
        id: "w3_q4",
        question: "What is the purpose of an Oracle (e.g. Chainlink) in decentralized smart contracts?",
        options: [
          "To speed up transaction confirmation times",
          "To securely bridge real-world off-chain data (such as asset price feeds, weather data, or external API results) onto deterministic blockchains",
          "To design frontend UI buttons for Web3 wallets",
          "To replace Ethereum validators",
        ],
        correctAnswer: 1,
        explanation: "Blockchains are deterministic isolated environments that cannot make external HTTP requests. Decentralized Oracles provide cryptographic proofs of real-world data feeds.",
        skillArea: "Blockchain Oracles & Off-Chain Data",
        difficulty: "Medium",
      },
      {
        id: "w3_q5",
        question: "When interacting with a smart contract from a Next.js frontend using Viem/Wagmi, why should you call 'simulateContract' before sending the actual transaction to the user's wallet?",
        options: [
          "It automatically mines the transaction locally without gas",
          "It simulates execution against the current block state, catching reverts or out-of-gas errors beforehand and preventing the user from losing gas fees on failed transactions",
          "It encrypts the user's seed phrase",
          "It is required by the browser",
        ],
        correctAnswer: 1,
        explanation: "Transaction simulation catches logic reverts, permission rejections, and estimation errors before the user approves the wallet prompt, ensuring a seamless user experience.",
        skillArea: "Frontend Web3 UX & Transaction Simulation",
        difficulty: "Medium",
      },
      {
        id: "w3_q6",
        question: "What is an ERC-20 token standard versus an ERC-721 token standard?",
        options: [
          "ERC-20 is for fungible tokens (where every token is interchangeable, like currency); ERC-721 is for non-fungible tokens (NFTs, where every token has a unique token ID)",
          "ERC-20 is for video streaming; ERC-721 is for music",
          "ERC-20 only works on Bitcoin; ERC-721 works on Ethereum",
          "They are identical standards with different names",
        ],
        correctAnswer: 0,
        explanation: "ERC-20 defines interchangeable balances (tokens, stablecoins). ERC-721 defines non-fungible unique asset identifiers (NFTs, digital certificates).",
        skillArea: "EVM Token Standards (ERC-20 vs ERC-721)",
        difficulty: "Easy",
      },
      {
        id: "w3_q7",
        question: "What is Account Abstraction (ERC-4337), and why is it a game-changer for Web3 hackathon projects?",
        options: [
          "Deleting user accounts when inactive",
          "Allowing smart contracts to function as user accounts, enabling gasless transactions (sponsored by paymasters), social recovery, and Web2-style email logins without seed phrases",
          "A tool to trade crypto on exchanges",
          "An algorithm for mining Bitcoin faster",
        ],
        correctAnswer: 1,
        explanation: "ERC-4337 decouples user accounts from private key cryptography, allowing projects to sponsor gas fees for judges and onboard users without requiring browser wallet extensions.",
        skillArea: "Account Abstraction (ERC-4337)",
        difficulty: "Hard",
      },
      {
        id: "w3_q8",
        question: "Which Solidity keyword stores parameters in temporary, non-modifiable execution memory with the lowest gas consumption for external function arguments?",
        options: [
          "storage",
          "calldata",
          "memory",
          "constant",
        ],
        correctAnswer: 1,
        explanation: "Using `calldata` instead of `memory` for external function arguments avoids copying arrays to memory, saving considerable gas.",
        skillArea: "Solidity Gas Optimization & Memory Keywords",
        difficulty: "Medium",
      },
    ],
  },
];

export interface EvaluationResult {
  trackId: string;
  trackTitle: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  readinessTier: {
    title: string;
    badge: string;
    color: string;
    description: string;
  };
  strongPoints: string[];
  areasToImprove: {
    skill: string;
    recommendation: string;
    questionHint: string;
  }[];
  recommendedCourseId: string;
  recommendedCourseName: string;
  actionPlan: {
    stage: string;
    task: string;
  }[];
}

export function evaluateTrackReadiness(
  track: HackathonTrack,
  userAnswers: Record<string, number>
): EvaluationResult {
  let correctCount = 0;
  const strongPoints: string[] = [];
  const areasToImprove: {
    skill: string;
    recommendation: string;
    questionHint: string;
  }[] = [];

  track.questions.forEach((q) => {
    const selected = userAnswers[q.id];
    if (selected === q.correctAnswer) {
      correctCount++;
      if (!strongPoints.includes(q.skillArea)) {
        strongPoints.push(q.skillArea);
      }
    } else {
      areasToImprove.push({
        skill: q.skillArea,
        recommendation: q.explanation,
        questionHint: q.question.slice(0, 90) + "...",
      });
    }
  });

  const scorePercentage = Math.round((correctCount / track.questions.length) * 100);

  let readinessTier: EvaluationResult["readinessTier"];
  if (scorePercentage >= 85) {
    readinessTier = {
      title: "Hackathon Ready — High Competitor Profile",
      badge: "🔥 Ready to Win",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      description:
        "Outstanding! You possess the critical architectural and practical coding skills needed to excel in this hackathon track. You can confidently take the lead on architecture and core implementation.",
    };
  } else if (scorePercentage >= 65) {
    readinessTier = {
      title: "Solid Foundation — Ready with Minor Sprint Polish",
      badge: "⚡ Competitive Builder",
      color: "text-blue-600 bg-blue-50 border-blue-200",
      description:
        "Great foundation! You have good practical understanding of this domain. Review the highlighted gaps below over a 24-hour sprint to build maximum confidence during the hackathon.",
    };
  } else if (scorePercentage >= 45) {
    readinessTier = {
      title: "Developing Builder — Fast-Track Review Recommended",
      badge: "🛠️ Skill Sprint Needed",
      color: "text-amber-600 bg-amber-50 border-amber-200",
      description:
        "You understand the high-level concepts, but practical debugging, architecture, and edge-case patterns need reinforcement before jumping into an intense 36-48 hour hackathon.",
    };
  } else {
    readinessTier = {
      title: "Foundational Preparation Required",
      badge: "📚 Preparation Phase",
      color: "text-rose-600 bg-rose-50 border-rose-200",
      description:
        "Critical core concepts and tools need review. We strongly suggest completing the recommended LearnFlow course modules below before registering for competitive hackathons in this track.",
    };
  }

  const actionPlan = [
    {
      stage: "Step 1: Boilerplate Prep (0 - 4h)",
      task: "Set up and test your repository, environment variables, authentication, and database connection before the hackathon clock starts.",
    },
    {
      stage: "Step 2: Rapid Prototype MVP (4 - 24h)",
      task: "Focus purely on one primary killer feature workflow from start to finish with working sample data before designing extra features.",
    },
    {
      stage: "Step 3: Polish Gaps & Demo (24 - 48h)",
      task: `Review the ${areasToImprove.length} weak point(s) identified in this assessment, add clean loading states, and prepare a 3-minute screen-recorded demo video.`,
    },
  ];

  return {
    trackId: track.id,
    trackTitle: track.title,
    totalQuestions: track.questions.length,
    correctCount,
    scorePercentage,
    readinessTier,
    strongPoints,
    areasToImprove,
    recommendedCourseId: track.recommendedCourseId,
    recommendedCourseName: track.recommendedCourseName,
    actionPlan,
  };
}
