'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import DashboardView from '../components/DashboardView';
import GraphVisualizer from '../components/GraphVisualizer';
import RelationshipIntelligenceView from '../components/RelationshipIntelligenceView';
import Customer360View from '../components/Customer360View';
import CypherConsoleView from '../components/CypherConsoleView';
import { api } from '../lib/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [topologyData, setTopologyData] = useState({ nodes: [], edges: [] });
  const [intelligenceSubTab, setIntelligenceSubTab] = useState('households');

  useEffect(() => {
    loadTopology();
  }, []);

  const loadTopology = async () => {
    try {
      const res = await api.getTopology(120);
      if (res.data) {
        setTopologyData(res.data);
      }
    } catch (err) {
      console.warn('Topology fetch deferred:', err.message);
    }
  };

  const handleNavigate = (tab, options = {}) => {
    setActiveTab(tab);
    if (options.tab) {
      setIntelligenceSubTab(options.tab);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView onNavigate={handleNavigate} />
        )}

        {activeTab === 'visualizer' && (
          <div className="h-[780px] w-full">
            <GraphVisualizer initialData={topologyData} />
          </div>
        )}

        {activeTab === 'intelligence' && (
          <RelationshipIntelligenceView
            initialSubTab={intelligenceSubTab}
          />
        )}

        {activeTab === 'customer360' && (
          <Customer360View />
        )}

        {activeTab === 'console' && (
          <CypherConsoleView />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">NexusBank Core Graph Banking Platform</span>
            <span>•</span>
            <span>CognoDB openCypher (Bolt 5.0–5.4)</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Wexa AI Candidate Take-Home Assignment
          </div>
        </div>
      </footer>
    </div>
  );
}
