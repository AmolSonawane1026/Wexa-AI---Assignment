const express = require('express');
const router = express.Router();

const healthController = require('../controllers/healthController');
const bankingController = require('../controllers/bankingController');
const analyticsController = require('../controllers/analyticsController');
const queryController = require('../controllers/queryController');
const seedController = require('../controllers/seedController');

const { validateCypherQuery, validateTransfer } = require('../middlewares/validator');

// Health Check
router.get('/health', healthController.getHealth.bind(healthController));

// Core Banking & Customer 360
router.get('/banking/dashboard', bankingController.getDashboard.bind(bankingController));
router.get('/banking/accounts', bankingController.getAllAccounts.bind(bankingController));
router.get('/banking/customers', bankingController.getAllCustomers.bind(bankingController));
router.get('/banking/branches', bankingController.getBranches.bind(bankingController));
router.get('/banking/customers/:customerId/360', bankingController.getCustomer360.bind(bankingController));
router.post('/banking/transfers', validateTransfer, bankingController.createTransfer.bind(bankingController));

// Relationship Intelligence & Graph Analytics
router.get('/analytics/topology', analyticsController.getGraphTopology.bind(analyticsController));
router.get('/analytics/payment-flows/:accountNumber', analyticsController.getPaymentFlows.bind(analyticsController));
router.get('/analytics/households', analyticsController.getHouseholdNetworks.bind(analyticsController));
router.get('/analytics/referrals', analyticsController.getReferralChains.bind(analyticsController));
router.get('/analytics/branch-settlements', analyticsController.getInterBranchSettlements.bind(analyticsController));

// openCypher Query Console
router.get('/query/presets', queryController.getPresets.bind(queryController));
router.post('/query/execute', validateCypherQuery, queryController.runCustomQuery.bind(queryController));

// Seed & Reset
router.post('/seed', seedController.seedData.bind(seedController));
router.post('/seed/reset', seedController.resetData.bind(seedController));

module.exports = router;
