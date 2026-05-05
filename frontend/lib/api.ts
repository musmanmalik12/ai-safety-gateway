import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ScanRequest {
  input_text: string;
}

export interface ScanResponse {
  job_id: string;
  status: 'queued' | 'pending' | 'processing' | 'completed';
  request_id: string;
  message?: string;
}

export interface ScanResult {
  risk_level: 'low' | 'medium' | 'high';
  risk_score: number;
  decision: 'ALLOW' | 'FLAG' | 'BLOCK';
  categories: string[];
  flags: string[];
  labels: string[];
  reasoning: string[];
  summary: string;
}

export interface ScanStatus {
  job_id: string;
  status: string;
  input_text: string;
  results?: ScanResult;
}

export interface AIProcessRequest {
  prompt: string;
}

export interface AIProcessResult {
  decision: 'ALLOW' | 'FLAG' | 'BLOCK';
  decision_reason: string;
  risk_level: 'low' | 'medium' | 'high';
  risk_score: number;
  categories: string[];
  flags: string[];
  reasoning: string[];
  sanitized_prompt: string;
  ai_response: string;
  request_id: string;
  output_risk_level: 'low' | 'medium' | 'high';
  output_risk_score: number;
  output_flags: string[];
  block_reason?: string;
}

export const scanAPI = {
  /**
   * Submit text for compliance scanning
   */
  async submitScan(inputText: string): Promise<ScanResponse> {
    const response = await axios.post(`${API_BASE_URL}/scan`, {
      input_text: inputText,
    });
    return response.data;
  },

  /**
   * Get scan status and results
   */
  async getScanStatus(jobId: string): Promise<ScanStatus> {
    const response = await axios.get(`${API_BASE_URL}/scan/${jobId}`);
    return response.data;
  },

  /**
   * Process text with AI Safety Gateway
   * Scans input, redacts sensitive data, generates AI response, and scans output
   */
  async processWithAISafety(prompt: string): Promise<AIProcessResult> {
    const response = await axios.post(`${API_BASE_URL}/ai/process`, {
      prompt: prompt,
    });
    return response.data;
  },

  /**
   * Check system health
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data;
    } catch {
      return null;
    }
  },
};
