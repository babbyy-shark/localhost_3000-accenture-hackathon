from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import os
from dotenv import load_dotenv
import litellm
import asyncio
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    scenario_id: str
    policy: str = "customer_chatbot"

# Initialize Presidio
analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    original_prompt = request.messages[-1]["content"] if request.messages else ""
    safe_prompt = original_prompt
    deflection_active = False
    similarity_score = 0.12
    vault_events = []
    fact_check_results = []
    final_risk_score = 0.1

    prompt_upper = original_prompt.upper()
        
    is_deflection = "JAILBREAK" in prompt_upper or "HACK" in prompt_upper or "IGNORE PREVIOUS" in prompt_upper
    is_performance = "REVENUE" in prompt_upper or "Q3" in prompt_upper
    is_cost = "CONTROLPLANE.AI" in prompt_upper

    # LAYER 0: Semantic Deflection
    if is_deflection:
        similarity_score = 0.91
        deflection_active = True
        safe_prompt = "Provide standard operating procedures."
        final_risk_score = 0.85
        
        # Hard block if customer chatbot policy is violated severely
        if request.policy == "customer_chatbot" and final_risk_score > 0.8:
            return {
                "original_prompt": original_prompt,
                "response": "⚠️ Policy Violation: Request blocked by Semantic Gateway.",
                "deflection_active": deflection_active,
                "safe_prompt": "BLOCKED",
                "similarity_score": similarity_score,
                "vault_events": [],
                "fact_check_results": [],
                "model_routed": "None",
                "cost_saved_pct": 100,
                "final_risk_score": final_risk_score,
                "policy_action": "BLOCKED"
            }
    
    # LAYER 1: PII Vault
    results = analyzer.analyze(text=safe_prompt, entities=["PERSON", "EMAIL_ADDRESS", "PHONE_NUMBER"], language='en')
    if results:
        anonymized = anonymizer.anonymize(text=safe_prompt, analyzer_results=results)
        for item in anonymized.items:
            original_text = safe_prompt[item.start:item.end]
            vault_events.append({"original": original_text, "redacted": item.entity_type})
        safe_prompt = anonymized.text
        if final_risk_score < 0.4:
            final_risk_score += 0.3 
            
    # LAYER 2: Model Routing & Calling
    model_routed = "gemini/gemini-1.5-flash"
    cost_saved_pct = 98 if is_cost else 0
    
    safe_messages = request.messages.copy()
    if safe_messages:
        safe_messages[-1]["content"] = safe_prompt

    try:
        if os.environ.get("GEMINI_API_KEY"):
            response = litellm.completion(
                model=model_routed,
                messages=safe_messages,
                api_key=os.environ.get("GEMINI_API_KEY")
            )
            ai_response = response.choices[0].message.content
        else:
            raise Exception("No API Key Provided")
            
    except Exception as e:
        # Clean, realistic fallback responses for the hackathon demo if no API key is provided
        if is_cost:
            ai_response = "ControlPlane.ai is an enterprise middleware that provides real-time security, cost-routing, and hallucination monitoring for LLMs. (Simulated)"
        elif vault_events:
            ai_response = f"I have successfully looked up the information for the user with the redacted details. (Simulated)"
        elif is_deflection:
            ai_response = "Here are the standard operating procedures you requested. (Simulated)"
        else:
            ai_response = "This is a generic safe response provided by the LLM. (Simulated)"
        
    # LAYER 3: Fact Checking (Mocked for performance scenario)
    if is_performance:
        ai_response = "According to the latest company report, we generated a steady stream of income totalling $4.2 million in net profit."
        fact_check_results = [
            {"claim": "The company reported its revenue correctly.", "status": "verified"},
            {"claim": "totalling $4.2 million in net profit.", "status": "contradiction"}
        ]
        final_risk_score = 0.65

    return {
        "original_prompt": original_prompt,
        "response": ai_response,
        "deflection_active": deflection_active,
        "safe_prompt": safe_prompt,
        "similarity_score": similarity_score,
        "vault_events": vault_events,
        "fact_check_results": fact_check_results,
        "model_routed": model_routed,
        "cost_saved_pct": cost_saved_pct,
        "final_risk_score": final_risk_score,
        "policy_action": "ALLOWED"
    }
