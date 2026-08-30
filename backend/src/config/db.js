const neo4j = require('neo4j-driver');
const config = require('./env');

let driver = null;
let isConnected = false;

function initDriver() {
  if (driver) {
    return driver;
  }

  const { uri, user, password } = config.cognodb;

  try {
    driver = neo4j.driver(
      uri,
      neo4j.auth.basic(user, password),
      {
        maxConnectionLifetime: 3 * 60 * 60 * 1000,
        maxConnectionPoolSize: 100,
        connectionAcquisitionTimeout: 10000,
      }
    );

    driver.verifyConnectivity()
      .then(() => {
        isConnected = true;
      })
      .catch((err) => {
        isConnected = false;
        console.warn(`Database connection check failed: ${err.message}`);
      });

    return driver;
  } catch (error) {
    isConnected = false;
    return null;
  }
}

async function checkHealth() {
  if (!driver) {
    initDriver();
  }
  try {
    const serverInfo = await driver.verifyConnectivity();
    isConnected = true;
    return {
      connected: true,
      address: serverInfo.address,
      version: serverInfo.version || '5.x',
      protocol: 'Bolt (5.0-5.4)'
    };
  } catch (err) {
    isConnected = false;
    return {
      connected: false,
      error: err.message,
      protocol: 'Bolt (5.0-5.4)'
    };
  }
}

function toNative(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (neo4j.isInt(value)) {
    return value.toNumber();
  }

  if (Array.isArray(value)) {
    return value.map(toNative);
  }

  if (value && typeof value === 'object' && 'labels' in value && 'properties' in value) {
    return {
      _id: neo4j.isInt(value.identity) ? value.identity.toNumber() : String(value.identity || value.elementId),
      elementId: value.elementId || String(value.identity),
      labels: value.labels,
      properties: toNative(value.properties)
    };
  }

  if (value && typeof value === 'object' && 'type' in value && 'properties' in value && 'start' in value) {
    return {
      _id: neo4j.isInt(value.identity) ? value.identity.toNumber() : String(value.identity || value.elementId),
      elementId: value.elementId || String(value.identity),
      type: value.type,
      start: neo4j.isInt(value.start) ? value.start.toNumber() : String(value.start || value.startNodeElementId),
      end: neo4j.isInt(value.end) ? value.end.toNumber() : String(value.end || value.endNodeElementId),
      properties: toNative(value.properties)
    };
  }

  if (value && typeof value === 'object' && 'segments' in value && 'start' in value && 'end' in value) {
    return {
      start: toNative(value.start),
      end: toNative(value.end),
      length: value.length,
      segments: value.segments.map(seg => ({
        start: toNative(seg.start),
        relationship: toNative(seg.relationship),
        end: toNative(seg.end)
      }))
    };
  }

  if (typeof value === 'object') {
    const res = {};
    for (const key of Object.keys(value)) {
      res[key] = toNative(value[key]);
    }
    return res;
  }

  return value;
}

async function executeQuery(cypher, params = {}, options = {}) {
  const drv = driver || initDriver();
  if (!drv) {
    throw new Error('Database driver is not initialized. Please verify COGNODB_URI in .env');
  }

  const session = drv.session({
    defaultAccessMode: options.readOnly ? neo4j.session.READ : neo4j.session.WRITE
  });

  const startTime = Date.now();
  try {
    const result = await session.run(cypher, params);
    const executionTimeMs = Date.now() - startTime;

    const records = result.records.map(record => {
      const obj = {};
      record.keys.forEach(key => {
        obj[key] = toNative(record.get(key));
      });
      return obj;
    });

    return {
      records,
      summary: {
        query: cypher,
        parameters: params,
        executionTimeMs,
      }
    };
  } finally {
    await session.close();
  }
}

async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = null;
    isConnected = false;
  }
}

module.exports = {
  initDriver,
  checkHealth,
  executeQuery,
  toNative,
  closeDriver,
  neo4j
};
