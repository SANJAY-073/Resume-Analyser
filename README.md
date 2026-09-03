# 📄 Resume Analyser

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)
![Tech Stack](https://img.shields.io/badge/Node.js-Backend-green)
![Tech Stack](https://img.shields.io/badge/Vite-Frontend-orange)
![Tech Stack](https://img.shields.io/badge/TypeScript-Fullstack-blue)

An AI-powered web application that helps **analyse resumes** by extracting key information, matching skills, and providing structured insights.  
This project demonstrates **full-stack development** with **TypeScript, Node.js, and Vite**.

---

## ✨ Features
- 📂 **[Resume Upload](ca://s?q=Explain_resume_upload_feature)** – Upload resumes in PDF/DOCX formats.
- 🧠 **[Skill Extraction](ca://s?q=Explain_skill_extraction_feature)** – Detects technical and soft skills automatically.
- 🔍 **[Keyword Matching](ca://s?q=Explain_keyword_matching_feature)** – Compares resume content against job descriptions.
- 📊 **[Interactive Dashboard](ca://s?q=Explain_dashboard_feature)** – Clean UI to view results.
- ⚡ **[Server Integration](ca://s?q=Explain_server_integration)** – Node.js backend for processing.

---

## 🛠️ Tech Stack
- **Frontend**: Vite + TypeScript + HTML/CSS  
- **Backend**: Node.js + Express (`server.ts`)  
- **Data Handling**: JSON metadata + environment variables (`.env.example`)  
- **Package Management**: Bun + npm  

---

## 📂 Project Structure
Resume-Analyser/
├── assets/.aistudio       # AI Studio configs
├── data/                  # Sample resumes / datasets
├── server/                # Backend logic
├── src/                   # Frontend source code
├── index.html             # Entry point
├── server.ts              # Node.js server
├── package.json           # Dependencies
├── vite.config.ts         # Vite configuration
└── tsconfig.json          # TypeScript configuration

Code

---

## ⚙️ Installation & Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/SANJAY-073/Resume-Analyser.git
   cd Resume-Analyser
Install dependencies

bash
bun install
Configure environment

Copy .env.example → .env

Add required API keys or paths

Run the project

bash
bun run dev
📊 Usage
Open http://localhost:5173 in your browser.

Upload a resume file.

View extracted skills, keywords, and analysis results.

🌟 Future Enhancements
🤖 AI Scoring – Rate resumes against job descriptions.

📑 Multi-format Support – Add DOCX/LinkedIn profile parsing.

📤 Export Options – Download analysis reports in PDF/CSV.

📈 GitHub Stats
https://github-readme-stats.vercel.app/api?username=sanjay-073&show_icons=true&theme=radical

🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to add.
