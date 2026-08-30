# ControlPlane.ai 🛡️

**ControlPlane.ai** is an enterprise-grade middleware layer designed to sit between your employees and external Large Language Models (LLMs). It intercepts, analyzes, and scrubs prompts to prevent sensitive data leaks, while dynamically routing queries to optimize costs and fact-checking AI responses to prevent hallucinations.


## 🚀 The Problem
When enterprises use public LLMs, they face three massive risks:
1. **Data Leakage:** Employees accidentally pasting PII, SSNs, or proprietary code into prompts.
2. **Cost Overruns:** Wasting expensive, heavy models on trivial tasks that cheaper models could handle.
3. **Hallucinations:** Employees blindly trusting AI outputs that confidently state incorrect facts.

## 🛠️ The Solution: The Cognitive Immune System
ControlPlane.ai solves this using a 4-layer inspection pipeline alongside a centralized governance dashboard:

* **Layer 0: Semantic Gateway (Deflection)**
  Detects malicious intent (e.g., Jailbreaks) or policy violations in multi-turn conversations and deflects the prompt to a safe alternative before it reaches the LLM.
* **Layer 1: PII Vault (Powered by Microsoft Presidio)**
  Scans the prompt for sensitive data (SSNs, Names, Emails) and redacts them into safe tokens (e.g., `<EMAIL_ADDRESS>`) before the prompt reaches the LLM.
* **Layer 2: Smart Routing & Cost Engine**
  Dynamically analyzes the complexity of the prompt and routes it to the most cost-effective model (e.g., `gemini-3.6-flash`), saving up to 98% on API costs.
* **Layer 3: Fact Checking (NLI)**
  Intercepts the AI's response before it is shown to the user and cross-references it, placing a visual warning underline on any hallucinated facts.

### 📊 New Round 2 Features
* **CISO Governance Dashboard:** A dedicated stakeholder view to monitor real-time API traffic, false positive/negative rates, and threat interception metrics.
* **Configurable Policy Engine:** Switch between strict profiles (e.g., Customer Chatbot) and permissive profiles (e.g., Internal Copilot) to see the composite risk engine adapt dynamically.
* **Multi-Turn Context:** The backend now tracks conversational history, evaluating compounding risks across multiple messages.
* **LiteLLM Orchestration:** Integrated `litellm` for seamless, provider-agnostic multi-turn LLM routing and resilient fallbacks.

## 💻 Tech Stack
* **Frontend:** Next.js 14, React, Tailwind CSS, Shadcn UI
* **Backend:** FastAPI, Python, Microsoft Presidio (NLP), LiteLLM, Google Gemini 3.6 Flash API

## 🚦 How to Run Locally

### 1. Setup the Python Environment
Ensure you are in the project root directory, then activate your virtual environment and install dependencies:
```bash
# Windows
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Configure API Keys
In the `backend/` folder, create a `.env` file and add your Gemini API Key:
```text
GEMINI_API_KEY=your_google_ai_studio_key_here
```
*(Note: If you do not provide a key, the backend will gracefully fallback to simulated responses for hackathon demo safety!)*

### 3. Start the Backend
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

### 4. Start the Frontend (in a new terminal tab)
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:3000/demo` to access the dual-view **Employee Chat** and the **CISO Dashboard**.
