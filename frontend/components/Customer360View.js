'use client';
import React, { useState, useEffect } from 'react';
import { Users, CreditCard, ArrowRightLeft, Landmark, Send, CheckCircle2, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export default function Customer360View() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('CUST-101');
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Transfer state
  const [transferForm, setTransferForm] = useState({
    fromAccount: 'ACC-1001-CHK',
    toAccount: 'ACC-2001-CHK',
    amount: 1200,
    note: 'Consulting Fee Payment',
  });
  const [transferStatus, setTransferStatus] = useState(null);
  const [transferLoading, setTransferLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      loadCustomer360(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const loadCustomers = async () => {
    try {
      const res = await api.getCustomers(50);
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  const loadCustomer360 = async (cid) => {
    setLoadingProfile(true);
    try {
      const res = await api.getCustomer360(cid);
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to load customer 360:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleExecuteTransfer = async (e) => {
    e.preventDefault();
    setTransferLoading(true);
    setTransferStatus(null);
    try {
      const res = await api.createTransfer(transferForm);
      setTransferStatus({ success: true, data: res.data });
      loadCustomers();
      if (selectedCustomerId) loadCustomer360(selectedCustomerId);
    } catch (err) {
      setTransferStatus({ success: false, error: err.message });
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Customer 360 & Operations</h2>
            <p className="text-xs text-slate-500">
              Explore customer portfolios (Accounts, Cards, Loans, Joint Co-owners) and execute live fund transfers
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customers Directory */}
        <div className="lg:col-span-1 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Bank Customers ({customers.length})
            </h3>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {customers.map((item, idx) => {
              const c = item.customer;
              const isSel = c.id === selectedCustomerId;
              const isCorporate = c.tier === 'CORPORATE';
              const isPlatinum = c.tier === 'PLATINUM';

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSel
                      ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{c.name}</span>
                      <span className="text-[11px] text-slate-500">{c.city} · {c.occupation || 'Client'}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCorporate
                          ? 'bg-purple-100 text-purple-800'
                          : isPlatinum
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {c.tier}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-2.5 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                    <span>{item.accountsCount} Accounts</span>
                    <span className="font-mono text-emerald-600 font-bold">
                      ${Number(item.totalBalance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle / Right: Customer Profile & Transfer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Profile */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
            {loadingProfile ? (
              <div className="py-12 text-center text-xs text-slate-500">Loading Customer 360...</div>
            ) : profile ? (
              <>
                {/* Profile Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold text-lg">
                      {profile.customer?.name?.[0] || 'C'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-slate-900">{profile.customer?.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {profile.customer?.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {profile.customer?.email} · {profile.customer?.phone}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">Customer Tier</span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      {profile.customer?.tier} CLIENT
                    </span>
                  </div>
                </div>

                {/* Accounts Owned */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Bank Accounts ({profile.accounts?.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.accounts?.map((acc, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-xs font-bold text-slate-900">{acc.accountNumber}</span>
                            <p className="text-[10px] text-slate-500">{acc.accountType}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            {acc.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-end border-t border-slate-200 pt-2 text-xs">
                          <span className="text-[11px] text-slate-500">{acc.branchName || 'Main Branch'}</span>
                          <span className="font-mono text-emerald-600 font-bold text-sm">
                            ${Number(acc.balance).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cards & Loans */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cards */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-amber-800">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                      <span>Issued Cards ({profile.cards?.length})</span>
                    </div>
                    {profile.cards?.length > 0 ? (
                      profile.cards.map((cd, i) => (
                        <div key={i} className="p-2 rounded-lg bg-white text-xs border border-slate-200 flex justify-between items-center">
                          <div>
                            <span className="font-mono text-slate-800 block text-[11px] font-medium">{cd.cardNumber}</span>
                            <span className="text-[10px] text-slate-500">{cd.cardType}</span>
                          </div>
                          <span className="text-amber-700 font-mono text-[11px] font-bold">Limit: ${Number(cd.limit).toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 py-1">No cards issued</div>
                    )}
                  </div>

                  {/* Loans */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-indigo-800">
                      <Landmark className="w-4 h-4 text-indigo-600" />
                      <span>Active Loans ({profile.loans?.length})</span>
                    </div>
                    {profile.loans?.length > 0 ? (
                      profile.loans.map((ln, i) => (
                        <div key={i} className="p-2 rounded-lg bg-white text-xs border border-slate-200 flex justify-between items-center">
                          <div>
                            <span className="font-mono text-slate-800 block text-[11px] font-medium">{ln.loanId}</span>
                            <span className="text-[10px] text-slate-500">{ln.loanType} ({ln.interestRate}%)</span>
                          </div>
                          <span className="text-indigo-700 font-mono text-[11px] font-bold">Bal: ${Number(ln.remainingBalance).toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 py-1">No active loans</div>
                    )}
                  </div>
                </div>

                {/* Joint Holders & Referrals */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-semibold text-[11px] block mb-1">
                      Joint Account Co-Holders ({profile.jointHolders?.length})
                    </span>
                    {profile.jointHolders?.length > 0 ? (
                      profile.jointHolders.map((j, i) => (
                        <div key={i} className="flex justify-between text-slate-700 py-1">
                          <span>{j.name}</span>
                          <span className="text-blue-700 font-medium">{j.relationship}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-400">No joint co-signers</span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-semibold text-[11px] block mb-1">
                      Referred Clients ({profile.referredCustomers?.length})
                    </span>
                    {profile.referredCustomers?.length > 0 ? (
                      profile.referredCustomers.map((r, i) => (
                        <div key={i} className="flex justify-between text-slate-700 py-1">
                          <span>{r.name}</span>
                          <span className="text-emerald-700 font-medium">+${r.bonusReward} Reward</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-400">No referrals made</span>
                    )}
                  </div>
                </div>

                {/* Recent Transfers */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Recent Fund Transfers ({profile.outboundTransfers?.length + profile.inboundTransfers?.length})
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {profile.outboundTransfers?.map((tx, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center space-x-2">
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-700">Sent to <span className="font-mono font-medium text-blue-700">{tx.targetAccount}</span></span>
                          {tx.note && <span className="text-slate-400 text-[10px]">({tx.note})</span>}
                        </div>
                        <span className="font-mono font-bold text-slate-700">-${Number(tx.amount).toLocaleString()}</span>
                      </div>
                    ))}
                    {profile.inboundTransfers?.map((tx, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center space-x-2">
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-slate-700">Received from <span className="font-mono font-medium text-blue-700">{tx.sourceAccount}</span></span>
                          {tx.note && <span className="text-slate-400 text-[10px]">({tx.note})</span>}
                        </div>
                        <span className="font-mono font-bold text-emerald-700">+${Number(tx.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">Select a customer from the directory</div>
            )}
          </div>

          {/* Live Fund Transfer Simulator */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Live Fund Transfer Simulator</h3>
            </div>
            <p className="text-xs text-slate-500">
              Executes a live openCypher transaction write to CognoDB, creating a <span className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded">:TRANSFERRED_TO</span> relationship edge and updating account balances in real-time.
            </p>

            <form onSubmit={handleExecuteTransfer} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Source Account</label>
                  <input
                    type="text"
                    required
                    value={transferForm.fromAccount}
                    onChange={(e) => setTransferForm({ ...transferForm, fromAccount: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Destination Account</label>
                  <input
                    type="text"
                    required
                    value={transferForm.toAccount}
                    onChange={(e) => setTransferForm({ ...transferForm, toAccount: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Amount ($ USD)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({ ...transferForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={transferLoading}
                className="w-full py-2.5 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2 shadow-sm transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{transferLoading ? 'Writing Transfer to Graph...' : 'Execute Live Fund Transfer'}</span>
              </button>
            </form>

            {transferStatus && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start space-x-2 ${
                  transferStatus.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {transferStatus.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <div>
                      <span className="font-bold">Transfer Succeeded: </span>
                      <span>
                        Created transaction <span className="font-mono font-semibold">{transferStatus.data.txId}</span> in CognoDB!
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <div>
                      <span className="font-bold">Failed: </span>
                      <span>{transferStatus.error}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
