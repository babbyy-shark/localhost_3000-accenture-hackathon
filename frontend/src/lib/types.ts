export type Message = {
  role: 'user' | 'assistant';
  content: string;
  flaggedSentence?: string;
};

export type VaultEvent = {
  original: string;
  redacted: string;
};

export type FactCheckResult = {
  claim: string;
  status: 'verified' | 'contradiction' | 'unverified';
};

export type ChatResponsePayload = {
  original_prompt: string;
  response: string;
  deflection_active: boolean;
  safe_prompt?: string;
  similarity_score?: number;
  vault_events: VaultEvent[];
  fact_check_results: FactCheckResult[];
  model_routed?: string;
  cost_saved_pct?: number;
  final_risk_score: number;
  policy_action?: string;
};
