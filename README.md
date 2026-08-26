# ControlPlane.ai 🛡️

**ControlPlane.ai** is an enterprise-grade middleware layer designed to sit between your employees and external Large Language Models (LLMs). It intercepts, analyzes, and scrubs prompts to prevent sensitive data leaks, while dynamically routing queries to optimize costs and fact-checking AI responses to prevent hallucinations.

Built for the **Accenture Hackathon**.

## 🚀 The Problem
When employees use public LLMs, enterprises face three massive risks:
1. **Data Leakage:** Employees accidentally pasting PII, SSNs, or proprietary code into prompts.
2. **Cost Overruns:** Wasting expensive, heavy models (like Gemini Pro) on trivial tasks that cheaper models could handle.
3. **Hallucinations:** Employees blindly trusting AI outputs that confidently state incorrect facts.

## 🛠️ The Solution: A 4-Layer Architecture
ControlPlane.ai solves this using a 4-layer inspection pipeline (X-Ray):

* **Layer 0: Semantic Gateway**
  Calculates vector embeddings of the prompt to detect malicious intent or policy violations and deflects the prompt before an expensive LLM call is even made.
* **Layer 1: PII Vault (Powered by Microsoft Presidio)**
  Scans the prompt for sensitive data (SSNs, Names, Emails) and redacts them into safe tokens (e.g., `<PERSON>`) before the prompt reaches the LLM.
* **Layer 2: Smart Routing & Cost Engine**
  Dynamically analyzes the complexity of the prompt and routes it to the most cost-effective model (e.g., `gemini-3.6-flash` vs `gemini-3.7-pro`), saving up to 98% on API costs.
* **Layer 3: Fact Checking (NLI)**
  Intercepts the AI's response before it is shown to the user and cross-references it against internal company documents, placing a visual warning underline on any hallucinated facts.

## 💻 Tech Stack
* **Frontend:** Next.js 14, React, Tailwind CSS, Shadcn UI
* **Backend:** FastAPI, Python, Microsoft Presidio (NLP), Gemini REST API

## 🚦 How to Run Locally

### Backend (FastAPI)
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```
*(Requires a `.env` file with `GEMINI_API_KEY=your_key`)*

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000/demo` to access the ControlPlane X-Ray interface.
