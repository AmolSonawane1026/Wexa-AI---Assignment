# NexusBank — Graph Database Core Banking Platform

A core banking and relationship management system backed by a graph database using **CognoDB** over the standard **Bolt protocol (Bolt 5.0–5.4)**.

---

## 1. Why a Graph Database for Core Banking?

In traditional relational databases (SQL), banking data is split across isolated tables (`customers`, `accounts`, `cards`, `loans`, `transactions`, `branches`). While SQL works for single-account ledger updates, it quickly falls short when querying connected banking data:

- **Household & Co-Ownership Mapping:** Tracking family units or business partners sharing accounts requires multi-table self-joins in SQL. In openCypher, it is a single intuitive pattern:  
  `MATCH (c1:Customer)-[:OWNS]->(a:Account)<-[:OWNS]-(c2:Customer)`
- **Multi-Hop Payment & Payroll Flows:** Tracing money moving from corporate payroll to employee accounts and downstream peer transfers requires slow recursive CTEs in SQL. Graph databases traverse paths in constant time per hop ($O(1)$) using index-free adjacency.
- **Referral Networks:** Finding multi-level customer acquisition chains (e.g. 1 to 4 levels) is a native variable-length traversal:  
  `MATCH (c1:Customer)-[:REFERRED*1..4]->(c2:Customer)`
- **Cross-Branch Settlement:** Calculating total net liquidity moving between regional bank branch networks through aggregated account-to-account transfers.

---

## 2. Graph Data Model

### Nodes
- `Customer`: Retail, wealth, and corporate clients (`id`, `name`, `email`, `phone`, `tier`, `city`, `occupation`)
- `Account`: Checking, savings, investment, and corporate accounts (`accountNumber`, `accountType`, `balance`, `currency`, `status`, `interestRate`)
- `Branch`: Regional bank branch locations (`branchCode`, `name`, `city`, `state`, `manager`, `ifscSwift`)
- `Card`: Debit and credit cards (`cardNumber`, `cardType`, `limit`, `status`, `expiry`)
- `Loan`: Mortgages and loans (`loanId`, `loanType`, `principalAmount`, `remainingBalance`, `interestRate`, `termMonths`)
- `Merchant`: Payees and commercial vendors (`merchantId`, `name`, `category`, `city`)

### Relationships
- `(:Customer)-[:OWNS {role}]->(:Account)`
- `(:Customer)-[:JOINT_HOLDER_WITH {relationshipType}]->(:Customer)`
- `(:Customer)-[:REFERRED {bonusReward, referralDate}]->(:Customer)`
- `(:Account)-[:MAINTAINED_AT]->(:Branch)`
- `(:Customer)-[:HAS_CARD]->(:Card)-[:LINKED_TO]->(:Account)`
- `(:Customer)-[:APPLIED_FOR]->(:Loan)-[:DISBURSED_TO]->(:Account)`
- `(:Account)-[:TRANSFERRED_TO {txId, amount, note, category, timestamp}]->(:Account)`
- `(:Account)-[:PAID_BILL {amount, billType, timestamp}]->(:Merchant)`

---

## 3. Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # Official neo4j-driver connection pool for CognoDB Bolt protocol
│   │   │   └── env.js             # Environment variable configuration
│   │   ├── controllers/
│   │   │   ├── analyticsController.js  # Endpoints for households, payment flows, referrals, topology
│   │   │   ├── bankingController.js    # Endpoints for accounts, Customer 360, fund transfers
│   │   │   ├── healthController.js     # Bolt connection health probe
│   │   │   ├── queryController.js      # openCypher execution endpoint
│   │   │   └── seedController.js       # Seed trigger endpoint
│   │   ├── middlewares/
│   │   │   ├── errorHandler.js
│   │   │   └── validator.js
│   │   ├── routes/
│   │   │   └── apiRoutes.js       # Express router
│   │   ├── services/
│   │   │   ├── bankingService.js
│   │   │   ├── graphAnalyticsService.js
│   │   │   ├── queryService.js
│   │   │   └── seedService.js     # Data generator script
│   │   ├── app.js                 # Express application setup
│   │   └── server.js              # Server entrypoint
│   ├── scripts/
│   │   ├── seed.js                # Node.js seed script
│   │   └── seed.py                # Python seed script using official neo4j Python driver
│   ├── package.json
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── globals.css
│   ├── components/
│   │   ├── Navbar.js              # Top navigation & Bolt connection status
│   │   ├── DashboardView.js       # Bank overview & KPI metrics
│   │   ├── GraphVisualizer.js     # Canvas-based interactive graph explorer
│   │   ├── RelationshipIntelligenceView.js # Households, payment chains, referral trees
│   │   ├── Customer360View.js     # Customer portfolio & live transfer form
│   │   ├── CypherConsoleView.js   # Parameterized openCypher console with execution benchmarks
│   │   └── NodeDetailDrawer.js    # Inspector drawer for selected nodes
│   ├── lib/
│   │   └── api.js                 # REST client for backend
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js (v18+)
- (Optional) Python 3.9+ for running the Python driver script

### Step 1: Configure Environment
Create `backend/.env` with your CognoDB Cloud credentials:
```env
PORT=5000
COGNODB_URI=bolt+s://<your-instance>.databases.cognodb.cloud
COGNODB_USER=cognodb
COGNODB_PASSWORD=<your-password>
CORS_ORIGIN=http://localhost:3000
```

### Step 2: Run Backend
```bash
cd backend
npm install
npm run seed      # Populates the graph with branches, customers, accounts, loans, and transfers
npm run dev       # Starts server on http://localhost:5000
```

### Step 3: Run Frontend
```bash
cd frontend
npm install
npm run dev       # Starts Next.js app on http://localhost:3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Driver Compatibility (JavaScript & Python)

CognoDB speaks openCypher over Bolt and works with standard Neo4j client drivers.

### Node.js (`neo4j-driver`)
```javascript
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(process.env.COGNODB_USER, process.env.COGNODB_PASSWORD)
);

const session = driver.session();
const result = await session.run(
  'MATCH (c:Customer {id: $id})-[:OWNS]->(a:Account) RETURN c.name AS name, a.balance AS balance',
  { id: 'CUST-101' }
);
console.log(result.records.map(r => ({ name: r.get('name'), balance: r.get('balance') })));
await session.close();
```

### Python (`neo4j`)
```bash
pip install -r backend/requirements.txt
python backend/scripts/seed.py
```
```python
import os
from neo4j import GraphDatabase

driver = GraphDatabase.driver(
    os.getenv("COGNODB_URI"),
    auth=(os.getenv("COGNODB_USER"), os.getenv("COGNODB_PASSWORD"))
)

with driver.session() as session:
    result = session.run("MATCH (c:Customer) RETURN c.name AS name, c.tier AS tier")
    for row in result:
        print(row["name"], "-", row["tier"])

driver.close()
```

---

## 6. Key openCypher Queries

### Customer 360 Portfolio
```cypher
MATCH (c:Customer {id: $customerId})
OPTIONAL MATCH (c)-[:OWNS]->(a:Account)
OPTIONAL MATCH (a)-[:MAINTAINED_AT]->(br:Branch)
OPTIONAL MATCH (c)-[:HAS_CARD]->(card:Card)
OPTIONAL MATCH (c)-[:APPLIED_FOR]->(loan:Loan)
OPTIONAL MATCH (c)-[:JOINT_HOLDER_WITH]-(joint:Customer)
RETURN c, collect(DISTINCT a) AS accounts, collect(DISTINCT card) AS cards, collect(DISTINCT loan) AS loans
```

### Household & Joint Account Co-Ownership
```cypher
MATCH (c1:Customer)-[:OWNS]->(sharedAcc:Account)<-[:OWNS]-(c2:Customer)
WHERE c1.id < c2.id
OPTIONAL MATCH (c1)-[rel:JOINT_HOLDER_WITH]-(c2)
RETURN c1.name, c2.name, sharedAcc.accountNumber, sharedAcc.balance, rel.relationshipType
ORDER BY sharedAcc.balance DESC
```

### Multi-Hop Payment Chain
```cypher
MATCH path = (src:Account {accountNumber: $accountNumber})-[:TRANSFERRED_TO*1..3]->(dst:Account)
RETURN path
LIMIT 25
```

### Referral Growth Tree
```cypher
MATCH path = (c1:Customer)-[:REFERRED*1..4]->(c2:Customer)
RETURN 
  c1.name AS originalReferrer,
  length(path) AS depth,
  [n IN nodes(path) | n.name] AS chain,
  [r IN relationships(path) | r.bonusReward] AS rewards
ORDER BY depth DESC
```

### Inter-Branch Settlement Volume
```cypher
MATCH (src:Account)-[tx:TRANSFERRED_TO]->(dst:Account)
MATCH (src)-[:MAINTAINED_AT]->(srcBranch:Branch)
MATCH (dst)-[:MAINTAINED_AT]->(dstBranch:Branch)
WHERE srcBranch <> dstBranch
RETURN 
  srcBranch.name AS fromBranch,
  dstBranch.name AS toBranch,
  count(tx) AS transactionCount,
  sum(tx.amount) AS totalSettlementVolume
ORDER BY totalSettlementVolume DESC
```
