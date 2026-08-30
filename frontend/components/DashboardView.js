'use client';
import React, { useState, useEffect } from 'react';
import { Landmark, Users, CreditCard, DollarSign, Building2, ChevronRight, Zap, Network, GitFork, ArrowUpRight } from 'lucide-react';
import { api } from '../lib/api';

export default function DashboardView({ onNavigate }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard();
      setMetrics(res.data);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Managed Deposits',
      value: metrics?.totalDeposits ? `$${Number(metrics.totalDeposits).toLocaleString()}` : '$0',
      subtitle: `${metrics?.totalAccounts || 0} Active Bank Accounts`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Total Active Customers',
      value: metrics?.totalCustomers || '0',
      subtitle: 'Retail, Wealth & Corporate Clients',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
    },
    {
      title: 'Active Loan Portfolio',
      value: metrics?.totalLoanPortfolio ? `$${Number(metrics.totalLoanPortfolio).toLocaleString()}` : '$0',
      subtitle: `${metrics?.totalLoans || 0} Mortgages & Commercial Loans`,
      icon: Landmark,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Branch Network',
      value: metrics?.totalBranches || '4',
      subtitle: `${metrics?.totalCards || 0} Active Cards & Payment Channels`,
      icon: Building2,
      color: 'text-purple-600',
      bg: 'bg-purple-50 border-purple-100',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>CognoDB openCypher + Bolt 5.x Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            NexusBank Graph Core Banking Platform
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Manage interconnected banking relationships across customer portfolios, joint household accounts, multi-tier referral trees, and payroll payment disbursement chains.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={() => onNavigate('intelligence')}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <Network className="w-4 h-4" />
            <span>Relationship Intelligence</span>
          </button>
          <button
            onClick={() => onNavigate('visualizer')}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs shadow-sm transition-all"
          >
            <GitFork className="w-4 h-4 text-blue-600" />
            <span>Interactive Graph</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{card.title}</span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center border`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {loading ? '...' : card.value}
                </div>
                <div className="text-xs text-slate-500 mt-1">{card.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4 Feature Exploration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Household & Joint Accounts */}
        <div
          onClick={() => onNavigate('intelligence', { tab: 'households' })}
          className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer space-y-4 transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-blue-600 flex items-center space-x-1">
              <span>View Households</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Household & Joint Account Co-Ownership
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Discover shared wealth accounts, married couples, and co-signers with joint ownership across personal and corporate banking.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-blue-600 font-bold">Cypher:</span>
            <span className="truncate">{"MATCH (c1)-[:OWNS]->(a)<-[:OWNS]-(c2)"}</span>
          </div>
        </div>

        {/* Card 2: Payment & Payroll Chains */}
        <div
          onClick={() => onNavigate('intelligence', { tab: 'flows' })}
          className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer space-y-4 transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-blue-600 flex items-center space-x-1">
              <span>Trace Fund Flows</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Payment & Payroll Fund Flow Chains
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Trace how funds disburse from corporate operating accounts to employee payroll and downstream peer transfers.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-emerald-600 font-bold">Cypher:</span>
            <span className="truncate">{"(src:Account)-[:TRANSFERRED_TO*1..3]->(dst:Account)"}</span>
          </div>
        </div>

        {/* Card 3: Multi-Level Referral Trees */}
        <div
          onClick={() => onNavigate('intelligence', { tab: 'referrals' })}
          className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer space-y-4 transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Network className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-blue-600 flex items-center space-x-1">
              <span>View Referral Trees</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Customer Referral Acquisition Trees
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Map viral customer acquisition chains across 1 to 4 referral tiers and calculate total referral reward bonuses.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-purple-600 font-bold">Cypher:</span>
            <span className="truncate">{"(c1:Customer)-[:REFERRED*1..4]->(c2:Customer)"}</span>
          </div>
        </div>

        {/* Card 4: openCypher Console */}
        <div
          onClick={() => onNavigate('console')}
          className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer space-y-4 transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-blue-600 flex items-center space-x-1">
              <span>openCypher Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              openCypher Query Console & Playground
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Run custom openCypher queries over Bolt 5.x with real-time execution timing, tabular view, and instant visual graph rendering.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-700 font-bold">Protocol:</span>
            <span className="truncate">Bolt 5.0–5.4 over TLS (Official Neo4j Driver)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
