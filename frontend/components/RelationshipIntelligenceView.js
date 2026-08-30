'use client';
import React, { useState, useEffect } from 'react';
import { Network, Users, ArrowUpRight, Building2, Play, ArrowRight, Info } from 'lucide-react';
import { api } from '../lib/api';

export default function RelationshipIntelligenceView({ initialSubTab }) {
  const [activeTab, setActiveTab] = useState(initialSubTab || 'households');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Filter params
  const [accountNumber, setAccountNumber] = useState('CORP-ACC-8002');
  const [minHops, setMinHops] = useState(1);
  const [maxHops, setMaxHops] = useState(3);

  useEffect(() => {
    runAnalysis(activeTab);
  }, [activeTab]);

  const runAnalysis = async (tabName) => {
    setLoading(true);
    setError(null);
    try {
      if (tabName === 'households') {
        const res = await api.getHouseholdNetworks();
        setResults(res.data);
      } else if (tabName === 'flows') {
        const res = await api.getPaymentFlows(accountNumber, minHops, maxHops);
        setResults(res.data);
      } else if (tabName === 'referrals') {
        const res = await api.getReferralChains();
        setResults(res.data);
      } else if (tabName === 'settlements') {
        const res = await api.getInterBranchSettlements();
        setResults(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'households', label: '1. Households & Joint Accounts', icon: Users },
    { id: 'flows', label: '2. Payment & Payroll Chains', icon: ArrowUpRight },
    { id: 'referrals', label: '3. Referral Growth Trees', icon: Network },
    { id: 'settlements', label: '4. Inter-Branch Settlements', icon: Building2 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Relationship & Network Intelligence</h2>
            <p className="text-xs text-slate-500">
              Graph traversals revealing household units, payment disbursement chains, and referral trees
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isSel = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSel
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label.split('.')[1]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* 1. Households Tab */}
      {activeTab === 'households' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-1">
            <div className="flex items-center space-x-2 text-blue-800 font-semibold">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Why Graphs Excel at Household & Co-Ownership Mapping:</span>
            </div>
            <p className="text-slate-600">
              Banks frequently struggle to calculate total household wealth because accounts are co-owned by spouses, family members, or business partners. A graph pattern match <span className="font-mono text-blue-700 bg-blue-100/70 px-1 py-0.5 rounded">{"(:Customer)-[:OWNS]->(:Account)<-[:OWNS]-(:Customer)"}</span> instantly clusters families and joint beneficiaries without complex SQL joins.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Discovered Joint Account Co-Owners & Family Units</h3>
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading household graph...</div>
            ) : results && results.length > 0 ? (
              <div className="space-y-3">
                {results.map((h, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 hover:border-blue-200 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                          {h.relationshipType}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {h.customer1Name} & {h.customer2Name}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-600">
                        Shared Balance: ${Number(h.sharedBalance).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-600">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Shared Account</span>
                        <span className="font-mono text-blue-700 font-semibold">{h.sharedAccountNumber}</span>
                        <span className="text-slate-500 text-[10px] ml-2">({h.sharedAccountType})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 text-[11px] block">Customer Tiers</span>
                        <span className="text-slate-800 font-medium">{h.customer1Tier} / {h.customer2Tier}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">No joint accounts found.</div>
            )}
          </div>
        </div>
      )}

      {/* 2. Payment Flows Tab */}
      {activeTab === 'flows' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-1">
            <div className="flex items-center space-x-2 text-blue-800 font-semibold">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Multi-Hop Payment Chain Tracing:</span>
            </div>
            <p className="text-slate-600">
              Trace how funds disbursed from corporate operating/payroll accounts circulate to employee accounts and subsequently to secondary vendors and peer transfers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Source Account:</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Min Hops:</label>
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={minHops}
                  onChange={(e) => setMinHops(e.target.value)}
                  className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-center"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Max Hops:</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={maxHops}
                  onChange={(e) => setMaxHops(e.target.value)}
                  className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-center"
                />
              </div>
            </div>

            <button
              onClick={() => runAnalysis('flows')}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{loading ? 'Traversing...' : 'Trace Payment Chain'}</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Discovered Downstream Payment Chains</h3>
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Traversing fund flows...</div>
            ) : results && results.length > 0 ? (
              <div className="space-y-3">
                {results.map((rec, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {rec.hops} Hop Payment Chain
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Destination: {rec.accountChain[rec.accountChain.length - 1]}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      {rec.accountChain.map((acc, accIdx) => (
                        <React.Fragment key={accIdx}>
                          <span className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-800 font-semibold">
                            {acc}
                          </span>
                          {accIdx < rec.accountChain.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                No payment flows found for {accountNumber}. (Try testing with <span className="font-mono text-blue-600">CORP-ACC-8002</span> or <span className="font-mono text-blue-600">ACC-1001-CHK</span>).
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Referral Trees Tab */}
      {activeTab === 'referrals' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-1">
            <div className="flex items-center space-x-2 text-blue-800 font-semibold">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Multi-Level Referral Growth Network:</span>
            </div>
            <p className="text-slate-600">
              Graph traversals naturally map recursive viral referral trees <span className="font-mono text-blue-700 bg-blue-100/70 px-1 py-0.5 rounded">{"(:Customer)-[:REFERRED*1..4]->(:Customer)"}</span>, enabling the bank to identify top brand advocates and tier-2/tier-3 reward bonuses.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Customer Referral Acquisition Chains</h3>
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading referral trees...</div>
            ) : results && results.length > 0 ? (
              <div className="space-y-3">
                {results.map((tree, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                          {tree.referralDepth}-Level Referral Chain
                        </span>
                        <span className="text-xs font-bold text-slate-900">Origin: {tree.originalReferrer}</span>
                      </div>
                      <span className="text-xs text-emerald-600 font-mono font-bold">
                        Total Bonus: ${tree.rewards.reduce((a, b) => a + b, 0)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono mt-2">
                      {tree.referralChain.map((cust, cIdx) => (
                        <React.Fragment key={cIdx}>
                          <div className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-800">
                            <span className="font-semibold">{cust.name}</span>
                            <span className="text-[10px] text-slate-500 block font-sans">{cust.city}</span>
                          </div>
                          {cIdx < tree.referralChain.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">No referral chains found.</div>
            )}
          </div>
        </div>
      )}

      {/* 4. Inter-Branch Settlements Tab */}
      {activeTab === 'settlements' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-1">
            <div className="flex items-center space-x-2 text-blue-800 font-semibold">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Inter-Branch Settlement & Liquidity Distribution:</span>
            </div>
            <p className="text-slate-600">
              Aggregates inter-branch money flows across cities (New York, San Francisco, Chicago, London) to optimize branch liquidity and settlement reconciliation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Inter-Branch Net Settlement Volume</h3>
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Calculating branch settlements...</div>
            ) : results && results.length > 0 ? (
              <div className="space-y-3">
                {results.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-100">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{item.fromBranchName}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-bold text-slate-900">{item.toBranchName}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{item.transactionCount} Inter-Branch Transfers</span>
                      </div>
                    </div>

                    <span className="font-mono text-sm font-bold text-emerald-600">
                      ${Number(item.totalSettlementVolume).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">No inter-branch transfers recorded yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
