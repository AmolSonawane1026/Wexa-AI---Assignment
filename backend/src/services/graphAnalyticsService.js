const { executeQuery } = require('../config/db');

/**
 * Graph Analytics Service: Clean Banking Domain Relationship Intelligence
 * - Household & Joint Account Networks
 * - Multi-Hop Payment & Fund Flow Chains
 * - Customer Referral Trees (Multi-tier acquisition)
 * - Product Cross-Sell & Co-holding Analytics
 * - Inter-Branch Settlement Liquidity
 * - Full Graph Topology for Interactive Explorer
 */
class GraphAnalyticsService {
  /**
   * 1. Multi-Hop Payment & Fund Flow Tracing
   * Traces how funds circulate from corporate payroll/B2B to downstream accounts.
   */
  async findPaymentFlows(accountNumber, minHops = 1, maxHops = 4) {
    const minH = Math.max(1, parseInt(minHops, 10));
    const maxH = Math.min(5, Math.max(minH, parseInt(maxHops, 10)));

    const cypher = `
      MATCH path = (src:Account {accountNumber: $accountNumber})-[:TRANSFERRED_TO*${minH}..${maxH}]->(target:Account)
      WHERE src <> target
      RETURN path,
             length(path) AS hops,
             [n IN nodes(path) | n.accountNumber] AS accountChain,
             [r IN relationships(path) | {txId: r.txId, amount: r.amount, note: r.note, category: r.category}] AS transactionChain
      ORDER BY hops ASC, length(path) DESC
      LIMIT 30
    `;

    return await executeQuery(cypher, { accountNumber }, { readOnly: true });
  }

  /**
   * 2. Household & Joint Accounts Nexus
   * Discovers customers connected via shared accounts or joint holder relationships.
   */
  async getHouseholdNetworks() {
    const cypher = `
      MATCH (c1:Customer)-[:OWNS]->(sharedAcc:Account)<-[:OWNS]-(c2:Customer)
      WHERE c1.id < c2.id
      OPTIONAL MATCH (c1)-[rel:JOINT_HOLDER_WITH]-(c2)
      RETURN 
        c1.id AS customer1Id,
        c1.name AS customer1Name,
        c1.tier AS customer1Tier,
        c2.id AS customer2Id,
        c2.name AS customer2Name,
        c2.tier AS customer2Tier,
        sharedAcc.accountNumber AS sharedAccountNumber,
        sharedAcc.accountType AS sharedAccountType,
        sharedAcc.balance AS sharedBalance,
        coalesce(rel.relationshipType, 'CO_OWNER') AS relationshipType
      ORDER BY sharedBalance DESC
    `;

    return await executeQuery(cypher, {}, { readOnly: true });
  }

  /**
   * 3. Multi-Level Referral Trees
   * Tracks customer growth chains (who referred whom across 1 to 3 tiers).
   */
  async getReferralChains() {
    const cypher = `
      MATCH path = (c1:Customer)-[:REFERRED*1..4]->(c2:Customer)
      RETURN 
        c1.name AS originalReferrer,
        c1.id AS referrerId,
        length(path) AS referralDepth,
        [n IN nodes(path) | {id: n.id, name: n.name, tier: n.tier, city: n.city}] AS referralChain,
        [r IN relationships(path) | r.bonusReward] AS rewards
      ORDER BY referralDepth DESC, c1.name ASC
      LIMIT 20
    `;

    return await executeQuery(cypher, {}, { readOnly: true });
  }

  /**
   * 4. Inter-Branch Settlement Liquidity
   * Calculates total payment volumes flowing between bank branches.
   */
  async getInterBranchSettlements() {
    const cypher = `
      MATCH (srcAcc:Account)-[tx:TRANSFERRED_TO]->(dstAcc:Account)
      MATCH (srcAcc)-[:MAINTAINED_AT]->(srcBranch:Branch)
      MATCH (dstAcc)-[:MAINTAINED_AT]->(dstBranch:Branch)
      WHERE srcBranch <> dstBranch
      RETURN 
        srcBranch.branchCode AS fromBranchCode,
        srcBranch.name AS fromBranchName,
        dstBranch.branchCode AS toBranchCode,
        dstBranch.name AS toBranchName,
        count(tx) AS transactionCount,
        sum(tx.amount) AS totalSettlementVolume
      ORDER BY totalSettlementVolume DESC
    `;

    return await executeQuery(cypher, {}, { readOnly: true });
  }

  /**
   * 5. Graph Topology for Interactive Explorer
   */
  async getGraphTopology(limit = 120, labelFilter = null) {
    let nodeFilterClause = '';
    if (labelFilter && typeof labelFilter === 'string' && labelFilter.trim() !== '') {
      nodeFilterClause = `WHERE n:${labelFilter.trim()}`;
    }

    const nodesCypher = `
      MATCH (n)
      ${nodeFilterClause}
      RETURN DISTINCT n
      LIMIT $limit
    `;

    const relsCypher = `
      MATCH (n)-[r]->(m)
      RETURN DISTINCT n, r, m
      LIMIT $limit
    `;

    const [nodesRes, relsRes] = await Promise.all([
      executeQuery(nodesCypher, { limit: parseInt(limit, 10) }, { readOnly: true }),
      executeQuery(relsCypher, { limit: parseInt(limit, 10) }, { readOnly: true })
    ]);

    const nodeMap = new Map();
    nodesRes.records.forEach(rec => {
      const node = rec.n;
      if (node) {
        const id = node.elementId || String(node._id);
        const label = node.labels?.[0] || 'Node';
        const props = node.properties || {};
        const title = props.name || props.accountNumber || props.branchCode || props.cardNumber || props.loanId || props.merchantId || id;
        
        nodeMap.set(id, {
          id,
          label,
          title,
          properties: props
        });
      }
    });

    const edges = [];
    relsRes.records.forEach(rec => {
      const { n, r, m } = rec;
      if (n && r && m) {
        const sourceId = n.elementId || String(n._id);
        const targetId = m.elementId || String(m._id);
        
        if (!nodeMap.has(sourceId)) {
          const sLabel = n.labels?.[0] || 'Node';
          const sProps = n.properties || {};
          nodeMap.set(sourceId, {
            id: sourceId,
            label: sLabel,
            title: sProps.name || sProps.accountNumber || sourceId,
            properties: sProps
          });
        }
        if (!nodeMap.has(targetId)) {
          const tLabel = m.labels?.[0] || 'Node';
          const tProps = m.properties || {};
          nodeMap.set(targetId, {
            id: targetId,
            label: tLabel,
            title: tProps.name || tProps.accountNumber || targetId,
            properties: tProps
          });
        }

        edges.push({
          id: r.elementId || String(r._id),
          source: sourceId,
          target: targetId,
          type: r.type,
          properties: r.properties || {}
        });
      }
    });

    return {
      nodes: Array.from(nodeMap.values()),
      edges
    };
  }
}

module.exports = new GraphAnalyticsService();
