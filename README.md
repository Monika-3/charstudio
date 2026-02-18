# 🎨 AI Character Studio

AI Character Studio is a full-stack AI web application that allows users to create characters and generate AI-powered character poses using HuggingFace models.

Built with modern technologies like Next.js, Supabase, and Tailwind CSS.

---

## 🚀 Features

- 🔐 User authentication (Supabase Auth)
- 👤 Create & manage characters
- 🖼 Upload reference images
- ✨ Generate AI character poses
- 🧼 Optional background removal
- 🔎 Filter & search poses
- ☁️ Cloud storage (Supabase Storage)

---

## 🧠 How It Works

1. User selects a character and writes a pose description.
2. The app sends a prompt to the HuggingFace API.
3. AI generates a full-body character image.
4. (Optional) Background is removed in-browser.
5. Image is uploaded to Supabase Storage.
6. Pose data is saved in the database.

---

## 🏗 Tech Stack

| Layer        | Technology |
|-------------|------------|
| Frontend    | Next.js 16 + React 19 |
| Styling     | Tailwind CSS |
| Backend API | Next.js Route Handlers |
| Auth        | Supabase |
| Database    | Supabase PostgreSQL |
| Storage     | Supabase Storage |
| AI Model    | HuggingFace Inference API |
| Background Removal | @imgly/background-removal |

---

## ⚙️ Environment Variables

Create a `.env.local` file:

- NEXT_PUBLIC_SUPABASE_URL=your_url
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_key
- HUGGING_FACE_TOKEN=your_token

---

## 🖥 Run Locally
Open: `http://localhost:3000`

---
## 📦 Future Improvements (In Progress)

- Multiple pose variations per generation
- Prompt history system
- Image versioning
- Character tagging system
- Pose favorites
- AI style presets
- Usage quota system

---

## 💡 Purpose

This project demonstrates full-stack AI integration, authentication, cloud storage handling, and a real-world AI processing pipeline.

