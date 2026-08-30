const { executeQuery } = require('../config/db');

/**
 * Banking Service: Core Bank Management Operations
 * Customer 360, Accounts, Cards, Loans, Branch Portfolios, and Live Fund Transfers.
 */
class BankingService {
  /**
   * Overall Bank Dashboard Statistics
   */
  async getDashboardSummary() {
    const cypher = `
      MATCH (c:Customer)
      WITH count(c) AS totalCustomers
      MATCH (a:Account)
      WITH totalCustomers, count(a) AS totalAccounts, sum(a.balance) AS totalDeposits
      OPTIONAL MATCH (l:Loan)
      WITH totalCustomers, totalAccounts, totalDeposits, count(l) AS totalLoans, sum(l.remainingBalance) AS totalLoanPortfolio
      OPTIONAL MATCH (b:Branch)
      WITH totalCustomers, totalAccounts, totalDeposits, totalLoans, totalLoanPortfolio, count(b) AS totalBranches
      OPTIONAL MATCH (cd:Card)
      WITH totalCustomers, totalAccounts, totalDeposits, totalLoans, totalLoanPortfolio, totalBranches, count(cd) AS totalCards
      OPTIONAL MATCH ()-[tx:TRANSFERRED_TO]->()
      RETURN 
        totalCustomers,
        totalAccounts,
        totalDeposits,
        totalLoans,
        totalLoanPortfolio,
        totalBranches,
        totalCards,
        count(tx) AS totalTransfers,
        sum(tx.amount) AS totalTransactedVolume
    `;

    const result = await executeQuery(cypher, {}, { readOnly: true });
    return result.records[0] || {};
  }

  /**
   * Get all bank accounts with owner & branch information
   */
  async getAllAccounts(limit = 50) {
    const cypher = `
      MATCH (a:Account)
      OPTIONAL MATCH (c:Customer)-[:OWNS]->(a)
      OPTIONAL MATCH (a)-[:MAINTAINED_AT]->(br:Branch)
      RETURN a, c, br
      ORDER BY a.balance DESC
      LIMIT $limit
    `;
    const result = await executeQuery(cypher, { limit: parseInt(limit, 10) }, { readOnly: true });

    return result.records.map(rec => ({
      account: rec.a?.properties || {},
      owner: rec.c?.properties || null,
      branch: rec.br?.properties || null
    }));
  }

  /**
   * Get all bank customers with tier and accounts count
   */
  async getAllCustomers(limit = 50) {
    const cypher = `
      MATCH (c:Customer)
      OPTIONAL MATCH (c)-[:OWNS]->(a:Account)
      OPTIONAL MATCH (c)-[:HAS_CARD]->(cd:Card)
      OPTIONAL MATCH (c)-[:APPLIED_FOR]->(l:Loan)
      RETURN 
        c,
        count(DISTINCT a) AS accountsCount,
        sum(a.balance) AS totalBalance,
        count(DISTINCT cd) AS cardsCount,
        count(DISTINCT l) AS loansCount
      ORDER BY totalBalance DESC
      LIMIT $limit
    `;
    const result = await executeQuery(cypher, { limit: parseInt(limit, 10) }, { readOnly: true });

    return result.records.map(rec => ({
      customer: rec.c?.properties || {},
      accountsCount: rec.accountsCount || 0,
      totalBalance: rec.totalBalance || 0,
      cardsCount: rec.cardsCount || 0,
      loansCount: rec.loansCount || 0
    }));
  }

  /**
   * Customer 360: Full graph portfolio of a customer
   * Includes owned accounts, joint holders/spouse, issued cards, active loans,
   * referred friends, and transaction activity.
   */
  async getCustomer360(customerId) {
    const cypher = `
      MATCH (c:Customer {id: $customerId})
      OPTIONAL MATCH (c)-[ownRel:OWNS]->(a:Account)
      OPTIONAL MATCH (a)-[:MAINTAINED_AT]->(br:Branch)
      OPTIONAL MATCH (c)-[:HAS_CARD]->(card:Card)
      OPTIONAL MATCH (c)-[:APPLIED_FOR]->(loan:Loan)
      OPTIONAL MATCH (c)-[jointRel:JOINT_HOLDER_WITH]-(jointCust:Customer)
      OPTIONAL MATCH (c)-[refRel:REFERRED]->(referredCust:Customer)
      OPTIONAL MATCH (referrer:Customer)-[:REFERRED]->(c)
      OPTIONAL MATCH (a)-[outTx:TRANSFERRED_TO]->(targetAcc:Account)
      OPTIONAL MATCH (sourceAcc:Account)-[inTx:TRANSFERRED_TO]->(a)
      RETURN 
        c,
        collect(DISTINCT {account: a, branch: br, role: ownRel.role}) AS accounts,
        collect(DISTINCT card) AS cards,
        collect(DISTINCT loan) AS loans,
        collect(DISTINCT {customer: jointCust, relationship: jointRel.relationshipType}) AS jointHolders,
        collect(DISTINCT {customer: referredCust, reward: refRel.bonusReward, date: refRel.referralDate}) AS referredCustomers,
        referrer,
        collect(DISTINCT {tx: outTx, target: targetAcc}) AS outboundTransfers,
        collect(DISTINCT {tx: inTx, source: sourceAcc}) AS inboundTransfers
    `;

    const result = await executeQuery(cypher, { customerId }, { readOnly: true });
    if (!result.records.length || !result.records[0]?.c) {
      return null;
    }

    const rec = result.records[0];
    return {
      customer: rec.c.properties,
      accounts: rec.accounts.filter(a => a.account).map(a => ({
        ...a.account.properties,
        role: a.role,
        branchName: a.branch?.properties?.name,
        branchCity: a.branch?.properties?.city
      })),
      cards: rec.cards.filter(Boolean).map(c => c.properties),
      loans: rec.loans.filter(Boolean).map(l => l.properties),
      jointHolders: rec.jointHolders.filter(j => j.customer).map(j => ({
        ...j.customer.properties,
        relationship: j.relationship
      })),
      referredCustomers: rec.referredCustomers.filter(r => r.customer).map(r => ({
        ...r.customer.properties,
        bonusReward: r.reward,
        referralDate: r.date
      })),
      referredBy: rec.referrer?.properties || null,
      outboundTransfers: rec.outboundTransfers.filter(t => t.tx).map(t => ({
        ...t.tx.properties,
        targetAccount: t.target?.properties?.accountNumber
      })),
      inboundTransfers: rec.inboundTransfers.filter(t => t.tx).map(t => ({
        ...t.tx.properties,
        sourceAccount: t.source?.properties?.accountNumber
      }))
    };
  }

  /**
   * Execute a live fund transfer between accounts
   */
  async createTransfer({ fromAccount, toAccount, amount, currency = 'USD', note = 'Fund Transfer' }) {
    const txId = `TX-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const timestamp = Date.now();

    const cypher = `
      MATCH (src:Account {accountNumber: $fromAccount})
      MATCH (dst:Account {accountNumber: $toAccount})
      SET src.balance = src.balance - $amount,
          dst.balance = dst.balance + $amount
      CREATE (src)-[r:TRANSFERRED_TO {
        txId: $txId,
        amount: $amount,
        currency: $currency,
        note: $note,
        category: 'DIRECT_TRANSFER',
        timestamp: $timestamp
      }]->(dst)
      RETURN src, r, dst
    `;

    const result = await executeQuery(cypher, {
      fromAccount,
      toAccount,
      amount,
      currency,
      note,
      txId,
      timestamp
    });

    if (!result.records.length) {
      throw new Error(`Transfer failed. Please check that accounts ${fromAccount} and ${toAccount} exist.`);
    }

    const rec = result.records[0];
    return {
      success: true,
      txId,
      fromAccount,
      toAccount,
      amount,
      currency,
      note,
      timestamp,
      updatedBalances: {
        from: rec.src?.properties?.balance,
        to: rec.dst?.properties?.balance
      }
    };
  }

  /**
   * Get list of all bank branches and their total managed deposits
   */
  async getBranches() {
    const cypher = `
      MATCH (br:Branch)
      OPTIONAL MATCH (a:Account)-[:MAINTAINED_AT]->(br)
      RETURN 
        br,
        count(a) AS accountCount,
        sum(coalesce(a.balance, 0)) AS totalDeposits
      ORDER BY totalDeposits DESC
    `;
    const result = await executeQuery(cypher, {}, { readOnly: true });
    return result.records.map(rec => ({
      branch: rec.br?.properties || {},
      accountCount: rec.accountCount || 0,
      totalDeposits: rec.totalDeposits || 0
    }));
  }
}

module.exports = new BankingService();
