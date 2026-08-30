'use client';
import React, { useState, useEffect } from 'react';
import { Landmark, LayoutDashboard, Compass, Terminal, Users, Network } from 'lucide-react';
import { api } from '../lib/api';

export default function Navbar({ activeTab, setActiveTab }) {
  const [health, setHealth] = useState({ connected: false, loading: true });

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const res = await api.getHealth();
      setHealth({
        connected: res.status === 'UP' && res.database?.connected,
        protocol: res.database?.protocol || 'Bolt 5.x',
        version: res.database?.version || 'CognoDB Cloud',
        loading: false
      });
    } catch (err) {
      setHealth({ connected: false, error: err.message, loading: false });
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Bank Overview', icon: LayoutDashboard },
    { id: 'visualizer', label: 'Graph Explorer', icon: Compass },
    { id: 'intelligence', label: 'Relationship Intelligence', icon: Network },
    { id: 'customer360', label: 'Customer 360', icon: Users },
    { id: 'console', label: 'openCypher Console', icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-base tracking-tight">
                  NexusBank
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  CognoDB Graph
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-normal">
                Core Banking & Relationship Management
              </span>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: Bolt Connection Pill */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs">
              <div
                className={`w-2 h-2 rounded-full ${
                  health.connected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="text-[11px] font-medium text-slate-700">
                {health.loading ? 'Checking...' : health.connected ? 'Bolt 5.x Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
