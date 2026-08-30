const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

async function fetchJson(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `HTTP error ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error(`API error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Health
  getHealth: () => fetchJson('/health'),

  // Core Banking
  getDashboard: () => fetchJson('/banking/dashboard'),
  getAccounts: (limit = 50) => fetchJson(`/banking/accounts?limit=${limit}`),
  getCustomers: (limit = 50) => fetchJson(`/banking/customers?limit=${limit}`),
  getBranches: () => fetchJson('/banking/branches'),
  getCustomer360: (customerId) => fetchJson(`/banking/customers/${customerId}/360`),
  createTransfer: (transferData) =>
    fetchJson('/banking/transfers', {
      method: 'POST',
      body: JSON.stringify(transferData),
    }),

  // Relationship Intelligence & Graph Analytics
  getTopology: (limit = 120, label = '') =>
    fetchJson(`/analytics/topology?limit=${limit}${label ? `&label=${label}` : ''}`),
  getHouseholdNetworks: () => fetchJson('/analytics/households'),
  getPaymentFlows: (accountNumber, minHops = 1, maxHops = 3) =>
    fetchJson(`/analytics/payment-flows/${accountNumber}?minHops=${minHops}&maxHops=${maxHops}`),
  getReferralChains: () => fetchJson('/analytics/referrals'),
  getInterBranchSettlements: () => fetchJson('/analytics/branch-settlements'),

  // openCypher Console
  getPresets: () => fetchJson('/query/presets'),
  executeQuery: (query, params = {}) =>
    fetchJson('/query/execute', {
      method: 'POST',
      body: JSON.stringify({ query, params }),
    }),

  // Seed / Reset
  seedDatabase: () =>
    fetchJson('/seed', {
      method: 'POST',
    }),
  resetDatabase: () =>
    fetchJson('/seed/reset', {
      method: 'POST',
    }),
};
