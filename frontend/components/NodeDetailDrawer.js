'use client';
import React, { useState } from 'react';
import { X, Copy, Check, CreditCard, User, Building2, Landmark, Store, FileText } from 'lucide-react';

const ICON_MAP = {
  Customer: User,
  Account: CreditCard,
  Branch: Building2,
  Card: CreditCard,
  Loan: Landmark,
  Merchant: Store,
};

export default function NodeDetailDrawer({ element, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!element) return null;

  const { type, data } = element;
  const isNode = type === 'node';
  const label = isNode ? data.label : data.type;
  const properties = data.properties || {};
  const Icon = ICON_MAP[label] || FileText;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(properties, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute top-0 right-0 h-full w-80 sm:w-96 bg-white border-l border-slate-200 shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-200">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
              {isNode ? `Banking Node · ${label}` : `Relationship · ${label}`}
            </span>
            <h3 className="text-sm font-bold text-slate-900 truncate max-w-[200px]">
              {data.title || data.id}
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        <div>
          <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Attributes
          </h4>
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Graph ID</span>
              <span className="font-mono text-[11px] text-blue-700 font-semibold">{data.id}</span>
            </div>

            {Object.entries(properties).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center py-1 border-b border-slate-200/60 last:border-0">
                <span className="text-slate-500 capitalize">{key}</span>
                <span className="font-medium text-slate-900 text-right max-w-[180px] truncate">
                  {typeof val === 'number' && (key.toLowerCase().includes('balance') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('limit') || key.toLowerCase().includes('deposit'))
                    ? `$${val.toLocaleString()}`
                    : String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Raw Cypher Properties
            </h4>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-48 shadow-inner">
            {JSON.stringify(properties, null, 2)}
          </pre>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <button
          onClick={onClose}
          className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium rounded-lg text-xs transition-colors shadow-xs"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
}
