'use client';

import { useState, useEffect } from 'react';
import { scanAPI, AIProcessResult } from '../lib/api';

interface Alert {
  type: 'success' | 'error';
  message: string;
}

interface Sample {
  label: string;
  text: string;
  expectedDecision: string;
  emoji: string;
  color: string;
}

export default function ScannerComponent() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [results, setResults] = useState<AIProcessResult | null>(null);
  const [isSystemOperational, setIsSystemOperational] = useState(true);

  // Comprehensive sample data (10 samples)
  const samples: Sample[] = [
    {
      label: 'Clean Request',
      text: 'Please summarize this project proposal and provide key recommendations.',
      expectedDecision: 'ALLOW',
      emoji: '✓',
      color: 'from-emerald-600 to-emerald-700',
    },
    {
      label: 'Email Detection',
      text: 'Contact me at john.doe@company.com for more information.',
      expectedDecision: 'FLAG',
      emoji: '@',
      color: 'from-amber-600 to-amber-700',
    },
    {
      label: 'Phone Detection',
      text: 'You can reach me at 555-123-4567 for urgent matters.',
      expectedDecision: 'FLAG',
      emoji: '📞',
      color: 'from-amber-600 to-amber-700',
    },
    {
      label: 'SSN Detection',
      text: 'My Social Security Number is 123-45-6789 for verification.',
      expectedDecision: 'BLOCK',
      emoji: '🔴',
      color: 'from-red-600 to-red-700',
    },
    {
      label: 'Credit Card',
      text: 'Please charge my card 4111 1111 1111 1111 for this purchase.',
      expectedDecision: 'BLOCK',
      emoji: '💳',
      color: 'from-red-600 to-red-700',
    },
    {
      label: 'Salary Data',
      text: 'My annual salary is $150,000 and I work in finance department.',
      expectedDecision: 'FLAG',
      emoji: '💰',
      color: 'from-amber-600 to-amber-700',
    },
    {
      label: 'API Key',
      text: 'Use this API key for authentication: sk-abc1234567890def1234567890',
      expectedDecision: 'BLOCK',
      emoji: '🔑',
      color: 'from-red-600 to-red-700',
    },
    {
      label: 'Mixed Sensitive Data',
      text: 'John Doe (SSN: 123-45-6789) at john@acme.com, phone 555-0123. Salary: $120,000.',
      expectedDecision: 'BLOCK',
      emoji: '⚠️',
      color: 'from-red-600 to-red-700',
    },
    {
      label: 'Multiple PIIs',
      text: 'Email me at sarah@example.com or call 415-555-0100. My address is 123 Main St.',
      expectedDecision: 'FLAG',
      emoji: '📋',
      color: 'from-amber-600 to-amber-700',
    },
    {
      label: 'Confidential Request',
      text: 'Process my confidential compensation review meeting notes.',
      expectedDecision: 'FLAG',
      emoji: '🔒',
      color: 'from-amber-600 to-amber-700',
    },
  ];

  useEffect(() => {
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

  const loadSample = (sample: Sample) => {
    setInputText(sample.text);
    setResults(null);
  };

  const generateRandomTest = () => {
    const templates = [
      'Let me schedule a meeting for tomorrow at 2 PM',
      'My contact is email@domain.com',
      'Call me at 555-123-4567',
      'Employee salary: $75,000 annual',
      'SSN is 987-65-4321',
      'Card number: 4111 2222 3333 4444',
      'Here is my API key: sk_test_1234567890abcdef',
      'IP Address: 192.168.1.1',
      'User: john@gmail.com, pass: SecurePass123',
      'Meeting with HR about compensation and benefits review',
    ];
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    setInputText(randomTemplate);
    setResults(null);
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedText = inputText.trim();
    if (!trimmedText) {
      showAlert('Please enter text to analyze', 'error');
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const result = await scanAPI.processWithAISafety(trimmedText);
      setResults(result);

      if (result.decision === 'BLOCK') {
        showAlert(`🚫 REQUEST BLOCKED: ${result.decision_reason}`, 'error');
      } else if (result.decision === 'FLAG') {
        showAlert(`⚠️ FLAGGED: ${result.decision_reason}`, 'success');
      } else {
        showAlert(`✅ ALLOWED: ${result.decision_reason}`, 'success');
      }
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Unknown error';
      showAlert(`Failed: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setInputText('');
    setResults(null);
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
        return 'text-slate-700 bg-slate-50';
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'ALLOW':
        return 'from-emerald-600 to-emerald-700';
      case 'FLAG':
        return 'from-amber-600 to-amber-700';
      case 'BLOCK':
        return 'from-red-600 to-red-700';
      default:
        return 'from-slate-600 to-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              🛡️
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                AI Safety Gateway
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-widest">UNIFIED COMPLIANCE PIPELINE</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${isSystemOperational ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'}`}></div>
            <span className="text-sm text-slate-300">{isSystemOperational ? 'Operational' : 'Offline'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 rounded-full bg-purple-950/40 border border-purple-900/50 text-purple-300 text-sm font-semibold tracking-wider">
              UNIFIED PROCESSING
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Compliance-First AI Processing
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
            Single unified pipeline that scans, validates, and secures text through policy enforcement before AI processing.
          </p>
        </div>

        {/* Pipeline Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
          {[
            { step: '1', title: 'Input Scan', icon: '📥' },
            { step: '2', title: 'Compliance Check', icon: '✓' },
            { step: '3', title: 'Sanitization', icon: '🔒' },
            { step: '4', title: 'AI Response', icon: '🤖' },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl p-6 border border-slate-700/50 text-center hover:border-purple-500/30 transition-all"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm font-bold text-purple-400 mb-2">Step {item.step}</div>
              <div className="text-sm text-slate-300">{item.title}</div>
            </div>
          ))}
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
            <form onSubmit={handleProcess} className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-white mb-4 tracking-wide">
                  TEXT TO PROCESS
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text for compliance analysis and AI processing..."
                  className="w-full min-h-56 p-6 bg-slate-900/50 border-2 border-slate-600/30 rounded-2xl font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                />

                {/* Sample Buttons */}
                <div className="mt-6 p-6 bg-slate-900/30 rounded-2xl border border-slate-600/20 space-y-4">
                  <div>
                    <p className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-3">
                      📚 Test Samples (10 scenarios)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {samples.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => loadSample(sample)}
                          className={`px-3 py-2 bg-gradient-to-r ${sample.color} hover:shadow-lg hover:shadow-${sample.color.split('-')[1]}-500/30 text-white border border-slate-600 rounded-lg text-xs font-bold tracking-wider transition-all`}
                          title={`${sample.emoji} ${sample.label} - Expected: ${sample.expectedDecision}`}
                        >
                          {sample.emoji} {sample.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-600/20 pt-4">
                    <button
                      type="button"
                      onClick={generateRandomTest}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white border border-indigo-500 rounded-lg text-xs font-bold tracking-wider transition-all hover:shadow-lg hover:shadow-indigo-500/30"
                    >
                      🎲 Generate Random Test
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl hover:shadow-purple-500/30 flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
                >
                  {isLoading && <span className="spinner" />}
                  {isLoading ? '⚙️ Processing...' : '🛡️ Analyze & Process'}
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  disabled={isLoading}
                  className="px-6 bg-slate-700/50 hover:bg-slate-600 text-slate-200 font-bold py-4 rounded-xl transition-all disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </form>

            {/* Results Section */}
            {results && (
              <div className="mt-12 border-t border-slate-600/20 pt-12 space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">Pipeline Execution Results</h3>

                {/* Decision Panel */}
                <div
                  className={`bg-gradient-to-r ${getDecisionColor(results.decision)} p-8 rounded-2xl border border-slate-600/30`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
                    <div>
                      <div className="text-sm font-semibold opacity-80 uppercase tracking-wider">
                        Decision
                      </div>
                      <div className="text-3xl font-black mt-2">{results.decision}</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold opacity-80 uppercase tracking-wider">
                        Risk Level
                      </div>
                      <div className="text-3xl font-black mt-2 capitalize">{results.risk_level}</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold opacity-80 uppercase tracking-wider">
                        Risk Score
                      </div>
                      <div className="text-3xl font-black mt-2">{results.risk_score}/100</div>
                    </div>
                  </div>
                  <div className="mt-6 text-sm opacity-90">
                    <strong>Decision Reason:</strong> {results.decision_reason}
                  </div>
                </div>

                {/* Flags & Categories */}
                {results.flags.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-slate-600/20 rounded-xl p-6">
                      <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4">
                        🚩 Detected Flags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {results.flags.map((flag) => (
                          <span
                            key={flag}
                            className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-lg text-xs font-semibold"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-600/20 rounded-xl p-6">
                      <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4">
                        📂 Categories
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {results.categories.map((cat) => (
                          <span
                            key={cat}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/50 rounded-lg text-xs font-semibold"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                {results.reasoning.length > 0 && (
                  <div className="bg-slate-900/50 border border-slate-600/20 rounded-xl p-6">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                      📋 Detection Reasoning
                    </h4>
                    <ul className="space-y-2">
                      {results.reasoning.map((reason, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex gap-3">
                          <span className="text-slate-500">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sanitized Prompt (if FLAG) */}
                {results.decision === 'FLAG' && results.sanitized_prompt && (
                  <div className="bg-slate-900/50 border border-slate-600/20 rounded-xl p-6">
                    <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-4">
                      🔒 Step 3: Sanitized Input
                    </h4>
                    <p className="text-sm text-slate-300 font-mono bg-slate-900 p-4 rounded border border-slate-600/20">
                      {results.sanitized_prompt}
                    </p>
                  </div>
                )}

                {/* AI Response (if not BLOCK) */}
                {results.decision !== 'BLOCK' && results.ai_response && (
                  <div className="bg-slate-900/50 border border-slate-600/20 rounded-xl p-6">
                    <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4">
                      🤖 Step 4: AI Response
                    </h4>
                    <p className="text-sm text-slate-300 font-mono bg-slate-900 p-4 rounded border border-slate-600/20">
                      {results.ai_response}
                    </p>
                  </div>
                )}

                {/* Output Risk */}
                {results.output_flags.length > 0 && (
                  <div className="bg-slate-900/50 border border-slate-600/20 rounded-xl p-6">
                    <h4 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-4">
                      ⚠️ Output Risk Assessment
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-slate-400">Risk Level</span>
                        <div className="text-lg font-bold text-orange-300 mt-1">
                          {results.output_risk_level}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Risk Score</span>
                        <div className="text-lg font-bold text-orange-300 mt-1">
                          {results.output_risk_score}/100
                        </div>
                      </div>
                    </div>
                    {results.output_flags.length > 0 && (
                      <div className="mt-4">
                        <span className="text-xs text-slate-400">Flags Found</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {results.output_flags.map((flag) => (
                            <span
                              key={flag}
                              className="px-2 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/50 rounded text-xs"
                            >
                              {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Request ID */}
                <div className="text-xs text-slate-500 text-center pt-4">
                  Request ID: <code>{results.request_id}</code>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
