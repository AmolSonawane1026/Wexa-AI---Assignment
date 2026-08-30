'use client';
import React, { useState, useEffect } from 'react';
import { Terminal, Play, Clock, Sparkles, Copy, Check, Code } from 'lucide-react';
import { api } from '../lib/api';
import GraphVisualizer from './GraphVisualizer';

export default function CypherConsoleView() {
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('customer-portfolio');
  const [queryText, setQueryText] = useState('');
  const [paramsText, setParamsText] = useState('{}');

  const [loading, setLoading] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const res = await api.getPresets();
      setPresets(res.data || []);
      if (res.data?.length > 0) {
        const first = res.data[0];
        setSelectedPresetId(first.id);
        setQueryText(first.query);
        setParamsText(JSON.stringify(first.params, null, 2));
      }
    } catch (err) {
      console.error('Failed to load presets:', err);
    }
  };

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setQueryText(preset.query);
    setParamsText(JSON.stringify(preset.params || {}, null, 2));
  };

  const handleRunQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      let parsedParams = {};
      try {
        parsedParams = JSON.parse(paramsText || '{}');
      } catch (e) {
        throw new Error('Invalid JSON in Parameters input field.');
      }

      const res = await api.executeQuery(queryText, parsedParams);
      setQueryResult(res);
    } catch (err) {
      setError(err.message);
      setQueryResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyQuery = () => {
    navigator.clipboard.writeText(queryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">openCypher Query Console & Playground</h2>
            <p className="text-xs text-slate-500">
              Run parameterized openCypher queries directly against CognoDB over Bolt 5.x protocol with execution timing
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Preset Queries */}
        <div className="lg:col-span-1 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-500 tracking-wider pb-1 border-b border-slate-100">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Preset Banking Queries</span>
          </div>

          <div className="space-y-2">
            {presets.map((preset) => {
              const isSel = selectedPresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSel
                      ? 'bg-blue-50 border-blue-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <span className="text-[10px] uppercase font-mono tracking-wider text-blue-700 font-bold block">
                    {preset.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{preset.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{preset.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Editor & Results */}
        <div className="lg:col-span-3 space-y-5">
          {/* Query Editor Box */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">openCypher Query Editor</span>
              </div>
              <button
                onClick={handleCopyQuery}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-[11px] hover:text-slate-900"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Cypher Code Textarea */}
            <textarea
              rows={5}
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="MATCH (n) RETURN n LIMIT 25"
              className="w-full p-3.5 bg-slate-900 text-cyan-300 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed shadow-inner"
            />

            {/* Parameters & Execute Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="w-full sm:w-2/3 flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-mono font-medium shrink-0">$params:</span>
                <input
                  type="text"
                  value={paramsText}
                  onChange={(e) => setParamsText(e.target.value)}
                  placeholder='{"customerId": "CUST-101"}'
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleRunQuery}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2 shadow-sm active:scale-95 transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? 'Executing on CognoDB...' : 'Run openCypher'}</span>
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono">
              <strong>Query Error:</strong> {error}
            </div>
          )}

          {/* Query Results & Execution Benchmarks */}
          {queryResult && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
              {/* Benchmarks Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-900">
                    Query Results ({queryResult.data?.length || 0} records)
                  </span>
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-mono font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{queryResult.summary?.executionTimeMs || 0} ms</span>
                  </div>
                </div>

                {/* View Switcher Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 rounded font-medium ${
                      viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('graph')}
                    className={`px-3 py-1 rounded font-medium ${
                      viewMode === 'graph' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Visual Graph ({queryResult.graph?.nodes?.length || 0})
                  </button>
                  <button
                    onClick={() => setViewMode('json')}
                    className={`px-3 py-1 rounded font-medium ${
                      viewMode === 'json' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    JSON
                  </button>
                </div>
              </div>

              {/* View 1: Table */}
              {viewMode === 'table' && (
                <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        {queryResult.data?.length > 0 &&
                          Object.keys(queryResult.data[0]).map((col) => (
                            <th key={col} className="p-2.5 font-semibold">
                              {col}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                      {queryResult.data.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-50">
                          {Object.values(row).map((cell, cellIdx) => (
                            <td key={cellIdx} className="p-2.5 max-w-xs truncate">
                              {typeof cell === 'object' ? JSON.stringify(cell) : String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* View 2: Embedded Graph Visualizer */}
              {viewMode === 'graph' && (
                <div className="h-[450px]">
                  {queryResult.graph?.nodes?.length > 0 ? (
                    <GraphVisualizer initialData={queryResult.graph} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                      No nodes or edges returned to render. Ensure query RETURNs node or path variables.
                    </div>
                  )}
                </div>
              )}

              {/* View 3: Raw JSON */}
              {viewMode === 'json' && (
                <pre className="p-4 bg-slate-900 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto max-h-80 shadow-inner">
                  {JSON.stringify(queryResult.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
