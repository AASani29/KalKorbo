# 🚀 KalKorbo: Next-Gen Collaborative Issue Tracker

**KalKorbo** (Bengali for *"Will do tomorrow"* — but we help you do it today!) is a high-performance, real-time issue and task management platform designed for modern teams and developers. It blends a premium, glassmorphic UI with cutting-edge features like AI-powered voice commands and live collaborator presence.

🔗 **Live Demo:** [kalkorbo.netlify.app](https://kalkorbo.netlify.app/)

---

## 🌟 Overview

KalKorbo is built to bridge the gap between simple to-do lists and complex enterprise project management tools. It focuses on **visibility**, **speed**, and **interaction**. Whether you're a solo developer tracking GitHub repos or a team collaborating on a sprint, KalKorbo provides a fluid, real-time experience that keeps everyone in sync.

This project serves as a comprehensive showcase of my skills in:
- **Full-stack React Development** with TypeScript.
- **Real-time Backend Systems** using Supabase.
- **AI Integration** for enhanced user productivity.
- **Premium UI/UX Design** with smooth animations and responsive layouts.

---

## ✨ Key Features

### 🚀 Advanced Project Management & Tracking
Comprehensive workspace orchestration designed for high-velocity teams.
- **Centralized Dashboard**: Oversight of all active projects, featuring live statistics and quick-access cards.
- **Dynamic Project Creation**: Spin up new workspaces in seconds with custom branding colors and metadata.
- **Deep-Link Integration**: Direct links to **GitHub Repos** and **Live Demos** for every project.

### 📋 Collaborative Kanban Board
A high-performance, real-time board for tracking progress across the finish line.
- **Visual Status Tracking**: Group tasks into *To Do*, *In Progress*, and *Done* columns.
- **Assignment & Ownership**: Create and assign tasks to team members with clear avatars and role visibility.
- **Deadlines & Priorities**: Set precise due dates and choose from *High*, *Medium*, or *Low* priority levels to stay focused on what matters.

### 🎙️ AI Voice Agent & Navigation
Control your entire workspace using natural language through an integrated AI agent.
- **Voice Commands**: *"Add a high priority task to the Website project"* or *"Remind me to fix the login bug tomorrow."*
- **Smart Navigation**: Seamlessly switch between **Home**, **Dashboard**, and **Profile** pages just by speaking.
- **Intelligent Feedback**: The agent provides real-time confirmation and fuzzy matching for project names.

### 📅 Interactive Monthly Calendar
Stay ahead of your schedule with a premium, integrated calendar view.
- **Visual Deadlines**: See all project tasks mapped out across the month with color-coded status indicators.
- **Deadline Tracking**: Hover over dates to see task summaries and click to jump directly into task details.
- **Personal Schedule**: A dedicated view for your own assigned tasks to manage individual workload efficiently.

### 👥 Invitations & Access Control
Enterprise-grade security and collaboration tools powered by **Supabase**.
- **Real-time Invitations**: Invite collaborators via email with instant notifications and status tracking (Pending/Accepted).
- **Secure Access Control**: Robust Row-Level Security (RLS) ensures that project data and tasks are only accessible to authorized team members.
- **Live Presence**: See who is currently online and active within specific projects.

### 🔐 Secure Authentication & Personalization
- **Supabase Auth**: Industry-standard secure sign-in and sign-up flows.
- **Personalized Profile**: Custom avatars, bio management, and unique color schemes for each user.
- **User Onboarding**: A smooth, interactive flow for new users to set up their workspace in minutes.

---

## 🛠️ Tools & Technologies

### Frontend
- **React 18**: Component-based architecture.
- **TypeScript**: Type-safety throughout the application.
- **Vite**: Ultra-fast build tool and development server.
- **Tailwind CSS**: Utility-first styling for a custom, premium look.
- **Lucide React**: Beautiful, consistent iconography.

### Backend & Infrastructure
- **Supabase**: 
  - **PostgreSQL Database** for robust data storage.
  - **Realtime (WebSockets)** for presence and broadcast events.
  - **Edge Functions** for server-side logic (optional/extensible).
  - **Auth**: Secure social and email authentication.
  - **Storage**: Handling user avatars and assets.

### AI & Services
- **Groq API**: Lightning-fast LLM processing for command understanding.
- **Whisper (via Groq)**: High-accuracy voice transcription.

---

## 🎯 Use Cases

- **Developer Portfolios**: Organize your side projects with direct links to code and live versions.
- **Agile Teams**: Manage sprints with a real-time Kanban board where status updates reflect instantly for everyone.
- **Productivity Power-Users**: Use the Voice Assistant to quickly capture ideas and tasks without breaking your flow.
- **Remote Collaboration**: Use the Presence features to feel connected with your team, seeing their activity in real-time.

---

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Configure Environment**: Rename `.env.example` to `.env` and add your Supabase and Groq credentials.
4. **Run development server**: `npm run dev`


