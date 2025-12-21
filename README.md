# URewards - Premium Collaborative Task Tracker

URewards is a modern, high-performance task management application built for teams that value speed, clarity, and aesthetics.

## ✨ Key Features

- **Real-time Collaboration**: See who's online and wave at team members (Google Docs style presence).
- **Intelligent Dashboard**: A premium, glassmorphic UI with task stats, a dynamic calendar, and interactive widgets.
- **Voice Assistant**: Natural language task management powered by Groq (Llama 3.3).
- **Pro Design**: Beautifully crafted "Create" and "Edit" forms with a professional SaaS aesthetic.
- **Advanced Task Management**: Drag-and-drop support, status tracking, and team assignments.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Supabase account
- Groq API Key (for voice commands)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GROQ_API_KEY`
4. Run the development server:
   ```bash
   npm run dev
   ```

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend/Realtime**: Supabase
- **Icons**: Lucide React
- **AI/NLP**: Groq (Llama 3.3 & Whisper)
