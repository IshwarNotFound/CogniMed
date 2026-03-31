# CogniMed.AI

> **Production-grade AI clinical assistant frontend** — Neo-Brutalist design, MedGemma 4B-IT backend, zero-config PDF RAG pipeline.

CogniMed.AI is a modern clinical diagnostic interface that connects a React frontend to a Google Colab-hosted FastAPI backend powered by [MedGemma](https://developers.google.com/health/medgemma). It lets clinicians ask medical questions in natural language, upload patient documents for retrieval-augmented answers with page citations, and export the full diagnostic session as a formatted PDF report — all from the browser.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Frontend Setup](#frontend-setup)
   - [Backend Setup (Google Colab)](#backend-setup-google-colab)
5. [Environment Variables](#environment-variables)
6. [Available Scripts](#available-scripts)
7. [API Reference](#api-reference)
8. [Project Structure](#project-structure)
9. [Design System](#design-system)
10. [Key Components](#key-components)
11. [How the RAG Pipeline Works](#how-the-rag-pipeline-works)
12. [Exporting a Clinical Report](#exporting-a-clinical-report)
13. [Troubleshooting](#troubleshooting)
14. [Disclaimer](#disclaimer)

---

## Features

| Feature | Description |
|---|---|
| 🧠 **AI Chat Interface** | Real-time clinical Q&A powered by MedGemma 4B-IT (4-bit NF4 quantized). Supports multi-turn conversation history. |
| 📄 **PDF RAG Pipeline** | Upload any clinical document (discharge summaries, lab reports, research papers). The AI answers questions grounded in the document with cited page references. |
| 📊 **Clinical Report Export** | Generates a formatted PDF report of the entire diagnostic session entirely in the browser using jsPDF — no backend call required. |
| 📡 **Live System Telemetry** | Real-time GPU device name, VRAM allocation, system RAM, quantization status, and inference speed (tokens/sec) polled every 10 seconds. |
| ⚠️ **Emergency Override** | Hard-purges the ChromaDB vector index and resets the full session state from the sidebar with animated visual feedback. |
| 🌗 **Dark / Light Mode** | Semantic CSS variable theming with smooth scale-compress-and-expand transition physics on the main content area. |
| ✍️ **Markdown Rendering** | Full GitHub Flavoured Markdown (GFM) support with typewriter animation on every AI response. |
| 🖼️ **Image Attachment** | Send images alongside text messages to the multimodal MedGemma endpoint. |
| 💡 **Diagnostic Suggestions** | Seed query cards are surfaced when the chat is empty, pulled from the `/suggestions` backend endpoint. |

---

## Tech Stack

### Frontend

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 19 |
| Build Tool | Vite | 8 |
| Styling | Tailwind CSS | v4 |
| Animations | Framer Motion | 12 |
| PDF Export | jsPDF + jspdf-autotable | 4 / 5 |
| Markdown | react-markdown + remark-gfm | 10 / 4 |
| Icons | Lucide React + Google Material Symbols | — |
| Fonts | Space Grotesk, Inter, Manrope | — |

### Backend (Google Colab)

| Component | Technology |
|---|---|
| Server | FastAPI |
| AI Model | MedGemma 4B-IT (4-bit NF4, via `bitsandbytes`) |
| Vector Store | ChromaDB |
| Embeddings | `sentence-transformers/all-MiniLM-L6-v2` |
| PDF Parsing | PyMuPDF / pdfplumber |
| Tunnel | ngrok |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                      Browser (React)                        │
│                                                             │
│  ┌──────────┐  ┌─────────────┐  ┌────────────────────────┐ │
│  │  Header  │  │   Sidebar   │  │      Main Content       │ │
│  │ (status, │  │ (telemetry, │  │  ┌──────┐ ┌──────────┐ │ │
│  │  theme)  │  │  override)  │  │  │ PDF  │ │   Chat   │ │ │
│  │  └──────────┘  └─────────────┘  │  │Upload│ │  Window  │ │ │
│                                  │  └──────┘ └──────────┘ │ │
│                                  └────────────────────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS (ngrok tunnel)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Colab — FastAPI Backend                 │
│                                                             │
│  /health        /model-info     /suggestions                │
│  /chat ──────► MedGemma 4B-IT (4-bit NF4)                  │
│  /upload-pdf ► ChromaDB + MiniLM-L6-v2 embeddings          │
│  /clear-pdf     /reset-session                              │
└─────────────────────────────────────────────────────────────┘
```

The frontend polls `/health` every 30 seconds and `/model-info` every 10 seconds to keep the status indicators and telemetry panel up to date. All chat requests and PDF uploads flow through the ngrok tunnel to the Colab backend.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Google account** with access to Google Colab (free tier is sufficient for testing; a GPU runtime is required for inference)

### Frontend Setup

```bash
# 1. Clone the repository
git clone https://github.com/IshwarNotFound/CogniMed.git
cd CogniMed

# 2. Install dependencies
npm install

# 3. Create the environment file (see Environment Variables below)
cp .env.example .env   # or create .env manually

# 4. Start the development server
npm run dev
```

The app will be available at [http://localhost:5174](http://localhost:5174).

### Backend Setup (Google Colab)

1. Open `notebook/CongniMed_Refined.ipynb` in Google Colab.
2. Select a **GPU runtime**: `Runtime → Change runtime type → T4 GPU`.
3. Run all cells in order. The notebook will:
   - Install all Python dependencies (`fastapi`, `uvicorn`, `bitsandbytes`, `chromadb`, `sentence-transformers`, etc.)
   - Load and quantize MedGemma 4B-IT in 4-bit NF4 mode
   - Start the FastAPI server on port 8000
   - Launch an ngrok tunnel and print the public URL
4. Copy the printed ngrok URL (e.g., `https://abc123.ngrok-free.app`).
5. Paste it into your frontend `.env` file as `VITE_API_BASE_URL`.
6. Restart the Vite dev server (`npm run dev`).

> **Note:** The ngrok URL changes every time you restart the Colab session. Remember to update `.env` and restart the dev server when this happens.

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://your-ngrok-url.ngrok-free.app
```

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ Yes | The base URL of the FastAPI backend. Must point to the active ngrok tunnel. |

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Starts Vite HMR dev server on port 5174 |
| Production build | `npm run build` | Outputs optimised static files to `dist/` |
| Preview build | `npm run preview` | Locally preview the production build |
| Lint | `npm run lint` | Run ESLint across the entire codebase |

---

## API Reference

The FastAPI backend exposes the following endpoints. All requests require the `ngrok-skip-browser-warning: true` header (already handled by the frontend API client).

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `GET` | `/health` | Server + PDF status, polling heartbeat | — |
| `GET` | `/model-info` | GPU device name, VRAM usage, quantization, platform | — |
| `GET` | `/suggestions` | Seed diagnostic query suggestions for the empty-chat UI | — |
| `POST` | `/chat` | MedGemma inference with optional RAG context | `FormData`: `message`, `history` (JSON), `top_k`, `image?` |
| `POST` | `/upload-pdf` | Ingest a clinical document into ChromaDB | `FormData`: `file` (PDF) |
| `DELETE` | `/clear-pdf` | Flush the vector index for the current document | — |
| `POST` | `/reset-session` | Full session + vector purge (Emergency Override) | — |

### Example: `/chat` response

```json
{
  "response": "Based on the patient's CBC results...",
  "citations": [{ "page": 3, "excerpt": "..." }],
  "inference_time_ms": 1240,
  "tokens_generated": 87,
  "tokens_per_second": 70.2
}
```

### Example: `/upload-pdf` response

```json
{
  "status": "ok",
  "pdf_filename": "discharge_summary.pdf",
  "pages_indexed": 12,
  "chunks_created": 48
}
```

---

## Project Structure

```text
CogniMed/
├── notebook/
│   └── CongniMed_Refined.ipynb   # Google Colab backend notebook
├── public/                        # Static assets
├── src/
│   ├── api/
│   │   └── client.js             # All fetch/XHR wrappers for backend calls
│   ├── animations/
│   │   └── physics.js            # Framer Motion spring & easing presets
│   ├── assets/                   # Images, icons
│   ├── components/
│   │   ├── ChatWindow.jsx        # Message list with empty state + suggestions
│   │   ├── Header.jsx            # Top nav: logo, status, theme toggle, dropdowns
│   │   ├── InputBar.jsx          # Text + image input with send button
│   │   ├── MarkdownRenderer.jsx  # GFM renderer with syntax highlighting
│   │   ├── MessageBubble.jsx     # Individual chat message (user / assistant)
│   │   ├── PDFUploader.jsx       # Drag-and-drop PDF uploader with XHR progress
│   │   ├── Sidebar.jsx           # Telemetry sidebar + Emergency Override
│   │   ├── SuggestionCards.jsx   # Clickable seed query cards
│   │   ├── SystemStats.jsx       # Live GPU/VRAM/RAM telemetry panel
│   │   ├── TypewriterText.jsx    # Character-by-character typewriter animation
│   │   └── TypingIndicator.jsx   # Animated "AI is thinking" indicator
│   ├── utils/
│   │   └── pdfExport.js          # Client-side clinical report generation (jsPDF)
│   ├── App.jsx                   # Root component: state, routing, event handlers
│   ├── config.js                 # Reads VITE_API_BASE_URL from environment
│   ├── index.css                 # Design system tokens (CSS custom properties)
│   └── main.jsx                  # React DOM entry point
├── .env                          # Local environment variables (gitignored)
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## Design System

CogniMed.AI uses a **Neo-Brutalist** design language built on semantic CSS custom properties defined in `src/index.css`. All colours, shadows, and borders adapt automatically when the theme switches between `dark` and `light`.

### Colour Tokens

| Token | Dark Mode | Light Mode | Usage |
|---|---|---|---|
| `--brand-bg` | `#0d0d0d` | `#f5f0e8` | Page background |
| `--brand-surface` | `#1a1a1a` | `#fffdf7` | Card / sidebar surface |
| `--brand-primary` | `#f5c842` | `#d4a017` | Accent (buttons, highlights) |
| `--brand-secondary` | `#ff4d4d` | `#cc2200` | Danger / Emergency Override |
| `--brand-tertiary` | `#4dff91` | `#00a844` | Success states |
| `--brand-border` | `#ffffff` | `#1a1a1a` | All borders and box shadows |
| `--brand-error` | `#ff4d4d` | `#cc2200` | Error states |

### Typography

| Role | Font | Weight |
|---|---|---|
| Headlines / buttons | Space Grotesk | 900 (Black) |
| Body / labels | Inter | 400–700 |
| Data / telemetry | Manrope | 700 |

### Shadow Convention

Neo-Brutalist hard-offset shadows are applied via Tailwind utility:

```css
/* 4px hard shadow — default interactive element */
box-shadow: 4px 4px 0 0 var(--brand-border);

/* Hover state — shadow collapses as element translates */
hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
```

---

## Key Components

### `App.jsx`
Root state container. Owns: `theme`, `isOnline`, `history`, `isLoading`, `pdfState`, `isExporting`. Orchestrates server polling every 30 seconds, theme-switch animation physics, message sending, PDF export, and session reset.

### `ChatWindow.jsx`
Renders the full message history. When `history` is empty, shows `SuggestionCards`. As the AI responds, each message passes through `TypewriterText` for the character-animation effect.

### `PDFUploader.jsx`
Drag-and-drop zone that uses a hardened XHR upload (90-second timeout, real-time progress bar, granular FastAPI error parsing). On success, exposes the document's page count and chunk count to the parent.

### `SystemStats.jsx`
Polls `/model-info` every 10 seconds. Renders VRAM and RAM as animated progress bars with `NumberTicker` — a 60fps Framer Motion counter that isolates re-renders to a single text node.

### `Sidebar.jsx`
Fixed left panel containing `SystemStats` and the **Emergency Override** button. The override fires an animation sequence (red flash, translate, shadow collapse) before calling `/reset-session`, then notifies `App.jsx` to clear local history.

---

## How the RAG Pipeline Works

1. **Upload**: A PDF is sent to `/upload-pdf` via XHR with real-time upload progress.
2. **Chunking**: The backend splits the document into overlapping text chunks.
3. **Embedding**: Each chunk is embedded using `all-MiniLM-L6-v2` and stored in ChromaDB.
4. **Query**: On every `/chat` request, the top-`k` most relevant chunks (default `k=5`) are retrieved from ChromaDB and injected into the MedGemma prompt as context.
5. **Citations**: The backend returns the source page numbers alongside the response; the frontend renders them as inline citation badges below the AI message.
6. **Reset**: **Clear PDF** (`DELETE /clear-pdf`) flushes only the vector index. **Emergency Override** (`POST /reset-session`) purges both the index and the full conversation state.

---

## Exporting a Clinical Report

Click **Export Report** in the top-right corner of the main panel. This:

1. Collects the full conversation `history` and the current `pdfState` (loaded document metadata).
2. Passes them to `generateClinicalPDF()` in `src/utils/pdfExport.js`.
3. jsPDF constructs a formatted A4 document — header, session metadata, timestamped Q&A pairs, and citations — entirely in the browser.
4. The PDF opens in a new tab using Chrome's native PDF viewer. Click the download icon to save it.

> No backend call is made. The export works even when the Colab session is offline.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Status indicator shows **OFFLINE** | ngrok URL has changed or Colab session has expired | Restart the Colab notebook, copy the new ngrok URL, update `.env`, restart `npm run dev` |
| PDF upload times out after 90 seconds | Large file or slow Colab GPU | Try a smaller PDF or upgrade to a Colab Pro GPU runtime |
| `⚠️ Connection Error` in chat | Backend is unreachable | Check the backend is running in Colab and the ngrok tunnel is active |
| Telemetry shows `INITIALIZING...` forever | `/model-info` endpoint unreachable | Confirm the Colab backend has fully loaded the model (wait for the "Model loaded" log line) |
| PDF export opens blank tab | Chat history is empty | Send at least one message before exporting |
| `GPU MEMORY EXHAUSTED` toast | Colab GPU ran out of VRAM | Restart the Colab runtime and reload the model |

---

## Disclaimer

> **CogniMed.AI is a research and educational tool. It is NOT a certified medical device and must NOT be used as a substitute for professional medical advice, diagnosis, or treatment.** Always consult a qualified healthcare professional for medical decisions. The AI responses are generated by a language model and may be inaccurate, incomplete, or outdated.