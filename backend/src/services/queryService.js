const { executeQuery } = require('../config/db');

/**
 * Query Service: openCypher queries for core banking management
 */
class QueryService {
  getPresetQueries() {
    return [
      {
        id: 'customer-portfolio',
        name: 'Complete Customer 360 Portfolio (Accounts, Cards, Loans)',
        description: 'Traverses all accounts, debit/credit cards, and loans owned by a customer.',
        category: 'Customer 360',
        query: `MATCH (c:Customer {id: 'CUST-101'})
OPTIONAL MATCH (c)-[:OWNS]->(a:Account)
OPTIONAL MATCH (c)-[:HAS_CARD]->(cd:Card)
OPTIONAL MATCH (c)-[:APPLIED_FOR]->(l:Loan)
RETURN c, a, cd, l`,
        params: { customerId: 'CUST-101' }
      },
      {
        id: 'referral-tree',
        name: 'Multi-Tier Referral Growth Tree (2 to 4 levels)',
        description: 'Discovers viral referral growth chains connecting customers.',
        category: 'Growth & Referrals',
        query: `MATCH path = (c1:Customer)-[:REFERRED*1..4]->(c2:Customer)
RETURN path
LIMIT 10`,
        params: {}
      },
      {
        id: 'joint-households',
        name: 'Household & Joint Account Co-Owners',
        description: 'Finds married couples or business partners sharing bank accounts.',
        category: 'Relationship Banking',
        query: `MATCH (c1:Customer)-[:OWNS]->(a:Account)<-[:OWNS]-(c2:Customer)
WHERE c1.id < c2.id
RETURN c1, a, c2`,
        params: {}
      },
      {
        id: 'payment-chains',
        name: 'Multi-Hop Payroll & Vendor Payment Chains',
        description: 'Traces funds disbursed from corporate payroll down to retail accounts and peer transfers.',
        category: 'Payment Chains',
        query: `MATCH path = (corp:Account {accountNumber: 'CORP-ACC-8002'})-[:TRANSFERRED_TO*1..3]->(recipient:Account)
RETURN path
LIMIT 20`,
        params: { accountNumber: 'CORP-ACC-8002' }
      },
      {
        id: 'branch-deposits',
        name: 'Branch Liquidity & Deposit Distribution',
        description: 'Aggregates active accounts and deposits managed per bank branch.',
        category: 'Branch Management',
        query: `MATCH (b:Branch)<-[:MAINTAINED_AT]-(a:Account)
RETURN b.name AS branchName, b.city AS city, count(a) AS totalAccounts, sum(a.balance) AS totalDeposits
ORDER BY totalDeposits DESC`,
        params: {}
      }
    ];
  }

  async executeCustomQuery(query, params = {}) {
    const rawResult = await executeQuery(query, params, { readOnly: false });

    const nodeMap = new Map();
    const edgeMap = new Map();

    const extractGraphElements = (val) => {
      if (!val) return;

      if (val._id !== undefined && val.labels !== undefined && val.properties !== undefined) {
        const id = val.elementId || String(val._id);
        if (!nodeMap.has(id)) {
          const label = val.labels?.[0] || 'Node';
          const props = val.properties || {};
          const title = props.name || props.accountNumber || props.branchCode || props.cardNumber || props.loanId || props.merchantId || id;
          nodeMap.set(id, { id, label, title, properties: props });
        }
      } else if (val._id !== undefined && val.type !== undefined && val.start !== undefined && val.end !== undefined) {
        const id = val.elementId || String(val._id);
        if (!edgeMap.has(id)) {
          edgeMap.set(id, {
            id,
            source: String(val.start),
            target: String(val.end),
            type: val.type,
            properties: val.properties || {}
          });
        }
      } else if (val.segments && Array.isArray(val.segments)) {
        val.segments.forEach(seg => {
          extractGraphElements(seg.start);
          extractGraphElements(seg.relationship);
          extractGraphElements(seg.end);
        });
      } else if (Array.isArray(val)) {
        val.forEach(item => extractGraphElements(item));
      } else if (typeof val === 'object') {
        Object.values(val).forEach(v => extractGraphElements(v));
      }
    };

    rawResult.records.forEach(rec => {
      Object.values(rec).forEach(val => extractGraphElements(val));
    });

    return {
      records: rawResult.records,
      graph: {
        nodes: Array.from(nodeMap.values()),
        edges: Array.from(edgeMap.values())
      },
      summary: rawResult.summary
    };
  }
}

module.exports = new QueryService();
