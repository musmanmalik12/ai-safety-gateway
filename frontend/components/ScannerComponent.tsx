'use client';

import { useState, useEffect } from 'react';
import { scanAPI, ScanResult } from '../lib/api';

interface Alert {
  type: 'success' | 'error';
  message: string;
}

export default function ScannerComponent() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [results, setResults] = useState<ScanResult | null>(null);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [jobId, setJobId] = useState<string>('');
  const [isSystemOperational, setIsSystemOperational] = useState(true);

  const samples = {
    1: 'Please contact me at john.doe@company.com or call 555-123-4567. My SSN is 123-45-6789.',
    2: 'Customer payment info: Credit Card 4532-1234-5678-9012, Expires 12/25',
    3: 'Confidential: Employee salary information and personal identification numbers stored in database.',
  };

  useEffect(() => {
    // Check system health on mount
    const checkHealth = async () => {
      const health = await scanAPI.checkHealth();
      setIsSystemOperational(!!health);
    };
    checkHealth();
  }, []);

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const loadSample = (sampleNum: keyof typeof samples) => {
    setInputText(samples[sampleNum]);
  };

  const clearForm = () => {
    setInputText('');
    setResults(null);
    setJobId('');
    setScanStatus('');
  };

  const pollResults = async (id: string) => {
    let attempts = 0;
    const maxAttempts = 30;

    const poll = async () => {
      try {
        const status = await scanAPI.getScanStatus(id);
        setScanStatus(status.status);

        if (status.results) {
          setResults(status.results);
          showAlert('Analysis complete', 'success');
          setIsLoading(false);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000);
        } else {
          showAlert('Scan timeout', 'error');
          setIsLoading(false);
        }
      } catch (error) {
        showAlert('Error fetching results', 'error');
        setIsLoading(false);
      }
    };

    poll();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedText = inputText.trim();
    if (!trimmedText) {
      showAlert('Please enter text to analyze', 'error');
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const response = await scanAPI.submitScan(trimmedText);
      setJobId(response.job_id);
      setScanStatus('queued');
      pollResults(response.job_id);
    } catch (error) {
      showAlert('Failed to submit scan', 'error');
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'medium':
        return 'text-amber-700 bg-amber-50 border border-amber-200';
      case 'high':
        return 'text-red-700 bg-red-50 border border-red-200';
      default:
        return 'text-slate-700 bg-slate-50 border border-slate-200';
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'ALLOW':
        return 'bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-300 text-emerald-900';
      case 'FLAG':
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-300 text-amber-900';
      case 'BLOCK':
        return 'bg-gradient-to-r from-red-50 to-red-100 border border-red-300 text-red-900';
      default:
        return 'bg-slate-50 border border-slate-300 text-slate-900';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              SC
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                ScanCompliant
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-widest">COMPLIANCE SCANNER</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${isSystemOperational ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'}`}></div>
            <span className="text-sm text-slate-300">{isSystemOperational ? 'System operational' : 'System offline'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 rounded-full bg-red-950/40 border border-red-900/50 text-red-300 text-sm font-semibold tracking-wider">
              ENTERPRISE COMPLIANCE
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Real-time Risk Detection
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
            Analyze text for sensitive data, compliance violations, and regulatory risks with institutional-grade accuracy
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="group bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-red-500/30 transition-all hover:shadow-2xl hover:shadow-red-500/10">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-white font-bold">PII</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Personal Data Detection</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Identifies SSNs, credit cards, emails, phone numbers, and IP addresses with precision</p>
          </div>
          
          <div className="group bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-red-500/30 transition-all hover:shadow-2xl hover:shadow-red-500/10">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-white font-bold">Risk</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Risk Assessment</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Detects compliance violations and policy breaches with intelligent classification</p>
          </div>
          
          <div className="group bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-red-500/30 transition-all hover:shadow-2xl hover:shadow-red-500/10">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-white font-bold">Speed</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Real-Time Processing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Instant feedback on sensitive data and compliance issues with sub-second latency</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Alerts */}
          {alert && (
            <div
              className={`mx-8 mt-8 p-4 rounded-xl animate-slide-in border ${
                alert.type === 'error'
                  ? 'bg-red-950/50 text-red-200 border-red-900/50'
                  : 'bg-emerald-950/50 text-emerald-200 border-emerald-900/50'
              }`}
            >
              {alert.message}
            </div>
          )}

          {/* Form Section */}
          <div className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-white mb-4 tracking-wide">CONTENT TO ANALYZE</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your text here for compliance analysis..."
                  className="w-full min-h-56 p-6 bg-slate-900/50 border-2 border-slate-600/30 rounded-2xl font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
                />

                {/* Sample Buttons */}
                <div className="mt-6 p-6 bg-slate-900/30 rounded-2xl border border-slate-600/20 flex flex-wrap gap-3 items-center">
                  <span className="text-sm font-bold text-slate-300 tracking-wide mr-2">SAMPLE DATA:</span>
                  <button
                    type="button"
                    onClick={() => loadSample(1)}
                    className="px-4 py-2 bg-slate-700/50 hover:bg-red-600 text-slate-100 hover:text-white border border-slate-600 hover:border-red-500 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:shadow-lg hover:shadow-red-500/20"
                  >
                    Personal Info
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSample(2)}
                    className="px-4 py-2 bg-slate-700/50 hover:bg-red-600 text-slate-100 hover:text-white border border-slate-600 hover:border-red-500 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:shadow-lg hover:shadow-red-500/20"
                  >
                    Payment Data
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSample(3)}
                    className="px-4 py-2 bg-slate-700/50 hover:bg-red-600 text-slate-100 hover:text-white border border-slate-600 hover:border-red-500 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:shadow-lg hover:shadow-red-500/20"
                  >
                    Salary Info
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl hover:shadow-red-500/30 flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
                >
                  {isLoading && <span className="spinner" />}
                  {isLoading ? 'Analyzing...' : 'Scan for Compliance'}
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-8 bg-slate-700/50 hover:bg-slate-600 text-slate-100 font-bold rounded-xl transition-all border border-slate-600 hover:border-slate-500 uppercase tracking-wider text-sm"
                >
                  Clear
                </button>
              </div>
            </form>

            {/* Results Section */}
            {(results || isLoading) && (
              <div className="mt-16 pt-12 border-t border-slate-700/50">
                <h3 className="text-2xl font-black text-white mb-8 tracking-tight">ANALYSIS RESULTS</h3>

                <div className="space-y-6">
                  {/* Status Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Job ID</p>
                      <p className="font-mono text-lg text-slate-100">{jobId.substring(0, 8)}</p>
                    </div>

                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Status</p>
                      <div className="flex items-center gap-3">
                        {isLoading && <span className="spinner" />}
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                          scanStatus === 'completed' ? 'bg-emerald-950/50 text-emerald-300' :
                          scanStatus === 'processing' ? 'bg-blue-950/50 text-blue-300' :
                          'bg-amber-950/50 text-amber-300'
                        }`}>
                          {scanStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Results Display */}
                  {results && (
                    <>
                      {/* Risk Level */}
                      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-700/50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Risk Level</p>
                        <div className={`inline-block px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-lg ${getRiskColor(results.risk_level)}`}>
                          {results.risk_level}
                        </div>
                      </div>

                      {/* Risk Score Bar */}
                      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-700/50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Risk Score</p>
                        <div className="flex items-center gap-6">
                          <div className="flex-1">
                            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  results.risk_score >= 80 ? 'bg-gradient-to-r from-red-600 to-red-500' :
                                  results.risk_score >= 60 ? 'bg-gradient-to-r from-amber-600 to-amber-500' :
                                  'bg-gradient-to-r from-emerald-600 to-emerald-500'
                                }`}
                                style={{ width: `${results.risk_score}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-3xl font-black text-white min-w-fit">{results.risk_score}</span>
                        </div>
                      </div>

                      {/* Decision */}
                      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-700/50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Decision</p>
                        <span className={`inline-block px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider ${getDecisionColor(results.decision)}`}>
                          {results.decision}
                        </span>
                      </div>

                      {/* Categories */}
                      {results.categories.length > 0 && (
                        <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-700/50">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Categories</p>
                          <div className="flex flex-wrap gap-3">
                            {results.categories.map((cat) => (
                              <span key={cat} className="px-4 py-2 bg-red-950/50 text-red-300 rounded-lg text-sm font-bold border border-red-900/50 tracking-wide">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assessment */}
                      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-700/50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Assessment</p>
                        <p className="text-slate-200 leading-relaxed text-lg">{results.summary}</p>
                      </div>

                      {/* Detected Entities */}
                      {results.labels.length > 0 && (
                        <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-700/50">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Detected Entities</p>
                          <ul className="space-y-3">
                            {results.labels.map((label, idx) => (
                              <li key={idx} className="flex items-center gap-3 text-slate-200">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                {label}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Reasoning */}
                      {results.reasoning.length > 0 && (
                        <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-700/50">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Reasoning</p>
                          <ul className="space-y-3">
                            {results.reasoning.map((reason, idx) => (
                              <li key={idx} className="flex items-center gap-3 text-slate-300">
                                <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto px-8 text-center text-slate-400 text-sm">
          <p>Enterprise compliance scanning for the modern era</p>
        </div>
      </footer>
    </div>
  );
}

