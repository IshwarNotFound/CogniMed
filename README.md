# CogniMed.AI — Clinical Diagnostic Frontend

A production-grade Neo-Brutalist AI clinical assistant frontend, powered by a MedGemma backend running on Google Colab.

---

## Features

- **AI Chat Interface** — Real-time clinical Q&A powered by MedGemma (4-bit quantized)
- **PDF RAG Pipeline** — Upload clinical documents; the AI answers with cited page references
- **Clinical Report Export** — Generates a formatted PDF report of the session directly in the browser (no backend needed)
- **Live System Telemetry** — GPU device, VRAM allocation, inference speed (tokens/sec), and model status
- **Emergency Override** — Hard-purges the vector index and resets session state
- **Dark / Light Mode** — Semantic CSS variable theming with smooth transition physics
- **Markdown Rendering** — Full GFM support with typewriter animation on AI responses

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Framework  | React 19 + Vite 8                      |
| Styling    | Tailwind CSS v4 + Custom CSS Variables  |
| Animations | Framer Motion                           |
| PDF Export | jsPDF + jspdf-autotable                 |
| Fonts      | Space Grotesk, Inter, Manrope           |
| Icons      | Lucide React + Google Material Symbols  |
| Markdown   | react-markdown + remark-gfm             |

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd CogniMed-Frontend
npm install
```

### 2. Configure the backend URL

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://your-ngrok-url.ngrok-free.app
```

> ⚠️ The ngrok URL changes every time you restart the Colab session. Update `.env` and restart the dev server when it changes.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5174](http://localhost:5174)

---

## Backend

The backend is a FastAPI server running inside a Google Colab notebook (`notebook/CongniMed_Refined.ipynb`). It exposes:

| Method | Endpoint          | Description                        |
|--------|-------------------|------------------------------------|
| GET    | `/health`         | Server + PDF status                |
| GET    | `/model-info`     | GPU device, VRAM, quantization     |
| GET    | `/suggestions`    | Seed diagnostic query suggestions  |
| POST   | `/chat`           | MedGemma inference with RAG        |
| POST   | `/upload-pdf`     | Ingest clinical document into FAISS|
| DELETE | `/clear-pdf`      | Flush the vector index             |
| POST   | `/reset-session`  | Full session + vector purge        |

---

## Export Report

The **Export Report** button generates a clinical PDF entirely in the browser using jsPDF — no backend call, no API errors. Clicking it opens Chrome's native PDF viewer in a new tab. Use the download button in the viewer to save.

---

## Project Structure

```
src/
  api/          — Backend API client (fetch wrappers)
  animations/   — Framer Motion physics presets
  components/   — All UI components
  utils/        — pdfExport.js (client-side report generation)
  App.jsx       — Root state, routing, event handlers
  index.css     — Design system tokens (CSS variables)
```
