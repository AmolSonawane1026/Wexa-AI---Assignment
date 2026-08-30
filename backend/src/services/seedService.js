const { executeQuery } = require('../config/db');

async function seedBankData() {
  await executeQuery('MATCH (n) DETACH DELETE n');

  await executeQuery(`
    CREATE (b1:Branch {branchCode: 'BR-NYC-01', name: 'Manhattan Financial Center', city: 'New York', state: 'NY', manager: 'Sarah Jenkins', ifscSwift: 'NXUSUS33NYC'})
    CREATE (b2:Branch {branchCode: 'BR-SFO-02', name: 'Silicon Valley Tech Branch', city: 'San Francisco', state: 'CA', manager: 'Michael Chang', ifscSwift: 'NXUSUS66SFO'})
    CREATE (b3:Branch {branchCode: 'BR-CHI-03', name: 'Midwest Commercial Hub', city: 'Chicago', state: 'IL', manager: 'Robert Miller', ifscSwift: 'NXUSUS44CHI'})
    CREATE (b4:Branch {branchCode: 'BR-LON-04', name: 'London Gateway Office', city: 'London', state: 'UK', manager: 'Emma Watson', ifscSwift: 'NXUSGB22LON'})
  `);

  await executeQuery(`
    CREATE (c1:Customer {id: 'CUST-101', name: 'Eleanor Vance', email: 'eleanor.vance@aurora.io', phone: '+1-212-555-0143', tier: 'PLATINUM', city: 'New York', occupation: 'Tech Founder'})
    CREATE (a1:Account {accountNumber: 'ACC-1001-CHK', accountType: 'PREMIUM_CHECKING', balance: 142500.0, currency: 'USD', status: 'ACTIVE', interestRate: 1.25})
    CREATE (a2:Account {accountNumber: 'ACC-1002-SAV', accountType: 'HIGH_YIELD_SAVINGS', balance: 380000.0, currency: 'USD', status: 'ACTIVE', interestRate: 4.85})
    CREATE (c1)-[:OWNS {role: 'PRIMARY_OWNER'}]->(a1)
    CREATE (c1)-[:OWNS {role: 'PRIMARY_OWNER'}]->(a2)

    CREATE (c2:Customer {id: 'CUST-102', name: 'Marcus Vance', email: 'marcus.vance@horizon.com', phone: '+1-212-555-0188', tier: 'PLATINUM', city: 'New York', occupation: 'Architect'})
    CREATE (c2)-[:JOINT_HOLDER_WITH {relationshipType: 'SPOUSE'}]->(c1)
    CREATE (c2)-[:OWNS {role: 'JOINT_BENEFICIARY'}]->(a2)

    CREATE (c3:Customer {id: 'CUST-103', name: 'Sophia Chen', email: 'sophia.chen@stanford.alumni.org', phone: '+1-415-555-0199', tier: 'GOLD', city: 'San Francisco', occupation: 'AI Researcher'})
    CREATE (a3:Account {accountNumber: 'ACC-2001-CHK', accountType: 'STANDARD_CHECKING', balance: 68400.0, currency: 'USD', status: 'ACTIVE', interestRate: 0.75})
    CREATE (c3)-[:OWNS {role: 'PRIMARY_OWNER'}]->(a3)

    CREATE (c4:Customer {id: 'CUST-104', name: 'David Miller', email: 'david.miller@chicago-design.net', phone: '+1-312-555-0122', tier: 'STANDARD', city: 'Chicago', occupation: 'Creative Director'})
    CREATE (a4:Account {accountNumber: 'ACC-3001-CHK', accountType: 'STANDARD_CHECKING', balance: 24300.0, currency: 'USD', status: 'ACTIVE', interestRate: 0.50})
    CREATE (c4)-[:OWNS {role: 'PRIMARY_OWNER'}]->(a4)

    CREATE (c5:Customer {id: 'CUST-105', name: 'James Thornton', email: 'j.thornton@london-capital.co.uk', phone: '+44-20-7946-0912', tier: 'PLATINUM', city: 'London', occupation: 'Private Equity Director'})
    CREATE (a5:Account {accountNumber: 'ACC-4001-INV', accountType: 'WEALTH_INVESTMENT', balance: 890000.0, currency: 'USD', status: 'ACTIVE', interestRate: 5.20})
    CREATE (c5)-[:OWNS {role: 'PRIMARY_OWNER'}]->(a5)

    CREATE (corp1:Customer {id: 'CORP-201', name: 'Quantum Cloud Logistics Inc', email: 'treasury@quantumcloud.io', phone: '+1-800-555-9000', tier: 'CORPORATE', city: 'New York', occupation: 'Enterprise Logistics'})
    CREATE (aCorp1:Account {accountNumber: 'CORP-ACC-8001', accountType: 'CORPORATE_TREASURY', balance: 2850000.0, currency: 'USD', status: 'ACTIVE', interestRate: 3.50})
    CREATE (aCorp2:Account {accountNumber: 'CORP-ACC-8002', accountType: 'PAYROLL_DISBURSEMENT', balance: 450000.0, currency: 'USD', status: 'ACTIVE', interestRate: 2.10})
    CREATE (corp1)-[:OWNS {role: 'CORPORATE_PRIMARY'}]->(aCorp1)
    CREATE (corp1)-[:OWNS {role: 'CORPORATE_PRIMARY'}]->(aCorp2)
  `);

  await executeQuery(`
    MATCH (a1:Account {accountNumber: 'ACC-1001-CHK'}), (b1:Branch {branchCode: 'BR-NYC-01'})
    MATCH (a2:Account {accountNumber: 'ACC-1002-SAV'})
    MATCH (a3:Account {accountNumber: 'ACC-2001-CHK'}), (b2:Branch {branchCode: 'BR-SFO-02'})
    MATCH (a4:Account {accountNumber: 'ACC-3001-CHK'}), (b3:Branch {branchCode: 'BR-CHI-03'})
    MATCH (a5:Account {accountNumber: 'ACC-4001-INV'}), (b4:Branch {branchCode: 'BR-LON-04'})
    MATCH (aCorp1:Account {accountNumber: 'CORP-ACC-8001'})
    MATCH (aCorp2:Account {accountNumber: 'CORP-ACC-8002'})
    CREATE (a1)-[:MAINTAINED_AT]->(b1)
    CREATE (a2)-[:MAINTAINED_AT]->(b1)
    CREATE (a3)-[:MAINTAINED_AT]->(b2)
    CREATE (a4)-[:MAINTAINED_AT]->(b3)
    CREATE (a5)-[:MAINTAINED_AT]->(b4)
    CREATE (aCorp1)-[:MAINTAINED_AT]->(b1)
    CREATE (aCorp2)-[:MAINTAINED_AT]->(b1)
  `);

  await executeQuery(`
    MATCH (c1:Customer {id: 'CUST-101'}), (a1:Account {accountNumber: 'ACC-1001-CHK'}), (a2:Account {accountNumber: 'ACC-1002-SAV'})
    MATCH (c3:Customer {id: 'CUST-103'}), (a3:Account {accountNumber: 'ACC-2001-CHK'})
    MATCH (c4:Customer {id: 'CUST-104'}), (a4:Account {accountNumber: 'ACC-3001-CHK'})
    CREATE (card1:Card {cardNumber: '4111-XXXX-XXXX-9021', cardType: 'PLATINUM_VISA', limit: 35000.0, status: 'ACTIVE', expiry: '11/28'})
    CREATE (c1)-[:HAS_CARD]->(card1)
    CREATE (card1)-[:LINKED_TO]->(a1)
    CREATE (card2:Card {cardNumber: '5500-XXXX-XXXX-4412', cardType: 'WORLD_MASTERCARD', limit: 20000.0, status: 'ACTIVE', expiry: '06/27'})
    CREATE (c3)-[:HAS_CARD]->(card2)
    CREATE (card2)-[:LINKED_TO]->(a3)
    CREATE (loan1:Loan {loanId: 'LN-MORT-501', loanType: 'HOME_MORTGAGE', principalAmount: 650000.0, remainingBalance: 520000.0, interestRate: 5.75, termMonths: 360, status: 'ACTIVE'})
    CREATE (c1)-[:APPLIED_FOR]->(loan1)
    CREATE (loan1)-[:DISBURSED_TO]->(a2)
    CREATE (loan2:Loan {loanId: 'LN-AUTO-202', loanType: 'AUTO_LOAN', principalAmount: 45000.0, remainingBalance: 28400.0, interestRate: 6.25, termMonths: 60, status: 'ACTIVE'})
    CREATE (c4)-[:APPLIED_FOR]->(loan2)
    CREATE (loan2)-[:DISBURSED_TO]->(a4)
  `);

  await executeQuery(`
    MATCH (c1:Customer {id: 'CUST-101'})
    MATCH (c3:Customer {id: 'CUST-103'})
    MATCH (c4:Customer {id: 'CUST-104'})
    MATCH (c5:Customer {id: 'CUST-105'})
    CREATE (c1)-[:REFERRED {bonusReward: 150.0, referralDate: '2023-01-18'}]->(c3)
    CREATE (c3)-[:REFERRED {bonusReward: 100.0, referralDate: '2023-05-22'}]->(c4)
    CREATE (c4)-[:REFERRED {bonusReward: 250.0, referralDate: '2023-09-10'}]->(c5)
  `);

  await executeQuery(`
    MATCH (corpAcc:Account {accountNumber: 'CORP-ACC-8002'})
    MATCH (a1:Account {accountNumber: 'ACC-1001-CHK'})
    MATCH (a3:Account {accountNumber: 'ACC-2001-CHK'})
    MATCH (a4:Account {accountNumber: 'ACC-3001-CHK'})
    MATCH (a5:Account {accountNumber: 'ACC-4001-INV'})
    CREATE (corpAcc)-[:TRANSFERRED_TO {txId: 'TX-PAYROLL-101', amount: 18500.0, note: 'Executive Payroll', category: 'SALARY', timestamp: '2024-02-01T09:00:00Z'}]->(a1)
    CREATE (corpAcc)-[:TRANSFERRED_TO {txId: 'TX-PAYROLL-102', amount: 14200.0, note: 'Research Lead Payroll', category: 'SALARY', timestamp: '2024-02-01T09:00:00Z'}]->(a3)
    CREATE (a1)-[:TRANSFERRED_TO {txId: 'TX-PEER-001', amount: 2400.0, note: 'Consulting Fee Payment', category: 'SERVICES', timestamp: '2024-02-08T14:30:00Z'}]->(a3)
    CREATE (a3)-[:TRANSFERRED_TO {txId: 'TX-PEER-002', amount: 1100.0, note: 'Freelance Design Retainer', category: 'SERVICES', timestamp: '2024-02-12T11:15:00Z'}]->(a4)
    CREATE (a4)-[:TRANSFERRED_TO {txId: 'TX-PEER-003', amount: 3500.0, note: 'Syndicate Capital Call', category: 'INVESTMENT', timestamp: '2024-02-18T16:45:00Z'}]->(a5)
  `);

  await executeQuery(`
    MATCH (a1:Account {accountNumber: 'ACC-1001-CHK'})
    MATCH (corpAcc:Account {accountNumber: 'CORP-ACC-8001'})
    CREATE (m1:Merchant {merchantId: 'MERCH-AWS-01', name: 'Amazon Web Services', category: 'CLOUD_INFRASTRUCTURE', city: 'Seattle'})
    CREATE (m2:Merchant {merchantId: 'MERCH-UTIL-02', name: 'ConEdison Power & Gas', category: 'UTILITIES', city: 'New York'})
    CREATE (a1)-[:PAID_BILL {amount: 320.0, billType: 'ELECTRICITY', timestamp: '2024-02-05T08:00:00Z'}]->(m2)
    CREATE (corpAcc)-[:PAID_BILL {amount: 42500.0, billType: 'CLOUD_HOSTING', timestamp: '2024-02-10T12:00:00Z'}]->(m1)
  `);

  const nodeStats = await executeQuery(`
    MATCH (n)
    RETURN labels(n)[0] AS label, count(n) AS count
  `);

  const relStats = await executeQuery(`
    MATCH ()-[r]->()
    RETURN type(r) AS relType, count(r) AS count
  `);

  const totalNodesRes = await executeQuery('MATCH (n) RETURN count(n) AS total');
  const totalRelsRes = await executeQuery('MATCH ()-[r]->() RETURN count(r) AS total');

  return {
    success: true,
    message: 'Banking graph database successfully seeded.',
    stats: {
      totalNodes: totalNodesRes.records[0]?.total || 0,
      totalRelationships: totalRelsRes.records[0]?.total || 0,
      nodeBreakdown: nodeStats.records,
      relationshipBreakdown: relStats.records,
    }
  };
}

module.exports = {
  seedBankData
};
