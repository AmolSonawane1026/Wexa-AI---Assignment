#!/usr/bin/env python3
import os
import sys
from dotenv import load_dotenv

try:
    from neo4j import GraphDatabase
except ImportError:
    print("Error: 'neo4j' Python driver is not installed.")
    print("Install it with: pip install neo4j python-dotenv")
    sys.exit(1)

load_dotenv()

URI = os.getenv("COGNODB_URI", "bolt://localhost:7687")
USER = os.getenv("COGNODB_USER", "cognodb")
PASSWORD = os.getenv("COGNODB_PASSWORD", "")

def seed_graph():
    print(f"Connecting to CognoDB at: {URI}")

    try:
        driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
        driver.verify_connectivity()

        with driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")

            session.run("""
                CREATE (b1:Branch {branchCode: 'BR-NYC-01', name: 'Manhattan Financial Center', city: 'New York', manager: 'Sarah Jenkins'})
                CREATE (b2:Branch {branchCode: 'BR-SFO-02', name: 'Silicon Valley Tech Branch', city: 'San Francisco', manager: 'Michael Chang'})
                CREATE (b3:Branch {branchCode: 'BR-CHI-03', name: 'Midwest Commercial Hub', city: 'Chicago', manager: 'Robert Miller'})
            """)

            session.run("""
                CREATE (c1:Customer {id: 'CUST-101', name: 'Eleanor Vance', tier: 'PLATINUM', city: 'New York'})
                CREATE (a1:Account {accountNumber: 'ACC-1001-CHK', accountType: 'PREMIUM_CHECKING', balance: 142500.0})
                CREATE (a2:Account {accountNumber: 'ACC-1002-SAV', accountType: 'HIGH_YIELD_SAVINGS', balance: 380000.0})
                CREATE (c1)-[:OWNS {role: 'PRIMARY_OWNER'}]->(a1)
                CREATE (c1)-[:OWNS {role: 'PRIMARY_OWNER'}]->(a2)

                CREATE (c2:Customer {id: 'CUST-102', name: 'Marcus Vance', tier: 'PLATINUM', city: 'New York'})
                CREATE (c2)-[:JOINT_HOLDER_WITH {relationshipType: 'SPOUSE'}]->(c1)
                CREATE (c2)-[:OWNS {role: 'JOINT_BENEFICIARY'}]->(a2)

                CREATE (c3:Customer {id: 'CUST-103', name: 'Sophia Chen', tier: 'GOLD', city: 'San Francisco'})
                CREATE (a3:Account {accountNumber: 'ACC-2001-CHK', accountType: 'STANDARD_CHECKING', balance: 68400.0})
                CREATE (c3)-[:OWNS {role: 'PRIMARY_OWNER'}]->(a3)

                CREATE (corp:Customer {id: 'CORP-201', name: 'Quantum Cloud Logistics Inc', tier: 'CORPORATE', city: 'New York'})
                CREATE (aCorp:Account {accountNumber: 'CORP-ACC-8002', accountType: 'PAYROLL_DISBURSEMENT', balance: 450000.0})
                CREATE (corp)-[:OWNS {role: 'CORPORATE_PRIMARY'}]->(aCorp)
            """)

            session.run("""
                MATCH (a1:Account {accountNumber: 'ACC-1001-CHK'}), (b1:Branch {branchCode: 'BR-NYC-01'})
                MATCH (a2:Account {accountNumber: 'ACC-1002-SAV'})
                MATCH (a3:Account {accountNumber: 'ACC-2001-CHK'}), (b2:Branch {branchCode: 'BR-SFO-02'})
                MATCH (aCorp:Account {accountNumber: 'CORP-ACC-8002'})
                CREATE (a1)-[:MAINTAINED_AT]->(b1)
                CREATE (a2)-[:MAINTAINED_AT]->(b1)
                CREATE (a3)-[:MAINTAINED_AT]->(b2)
                CREATE (aCorp)-[:MAINTAINED_AT]->(b1)
            """)

            session.run("""
                MATCH (c1:Customer {id: 'CUST-101'}), (c3:Customer {id: 'CUST-103'})
                CREATE (c1)-[:REFERRED {bonusReward: 150.0, referralDate: '2023-01-18'}]->(c3)
            """)
            session.run("""
                MATCH (corpAcc:Account {accountNumber: 'CORP-ACC-8002'}), (a1:Account {accountNumber: 'ACC-1001-CHK'})
                CREATE (corpAcc)-[:TRANSFERRED_TO {txId: 'TX-PAYROLL-101', amount: 18500.0, note: 'Executive Payroll', category: 'SALARY', timestamp: '2024-02-01T09:00:00Z'}]->(a1)
            """)
            session.run("""
                MATCH (a1:Account {accountNumber: 'ACC-1001-CHK'}), (a3:Account {accountNumber: 'ACC-2001-CHK'})
                CREATE (a1)-[:TRANSFERRED_TO {txId: 'TX-PEER-02', amount: 2400.0, note: 'Consulting Fee', category: 'SERVICES', timestamp: '2024-02-08T14:30:00Z'}]->(a3)
            """)

            res = session.run("MATCH (n) RETURN count(n) AS count").single()
            print(f"Seed completed. Total nodes: {res['count']}")

        driver.close()
    except Exception as e:
        print(f"Seed failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    seed_graph()
