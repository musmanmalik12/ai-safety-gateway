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
