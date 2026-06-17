const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

const FSA_BASE_URL = 'https://data.food.gov.uk/food-alerts';

// Logging utility
const log = {
  info: (msg, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] ${msg}`);
    if (data) console.log(JSON.stringify(data, null, 2));
  },
  error: (msg, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] ${msg}`);
    if (error) {
      console.error(`  Message: ${error.message}`);
      console.error(`  Stack: ${error.stack}`);
    }
  },
  request: (req) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [REQUEST] ${req.method} ${req.originalUrl}`);
    if (Object.keys(req.query).length > 0) {
      console.log(`  Query params:`, req.query);
    }
  },
  response: (statusCode, duration, dataSize = null) => {
    const timestamp = new Date().toISOString();
    const sizeInfo = dataSize ? ` | Size: ${dataSize} bytes` : '';
    console.log(`[${timestamp}] [RESPONSE] Status: ${statusCode} | Duration: ${duration}ms${sizeInfo}`);
  },
  fsaRequest: (url) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [FSA API] Outgoing request: ${url}`);
  },
  fsaResponse: (status, duration) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [FSA API] Response: Status ${status} | Duration: ${duration}ms`);
  }
};

// Enable CORS for all origins (development)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  log.request(req);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    log.response(res.statusCode, duration);
  });

  next();
});

// Proxy endpoint for food alerts
app.get('/api/alerts', async (req, res) => {
  try {
    // Build query string from request params
    const params = new URLSearchParams();

    // Parameter mapping for FSA API (some params need dot notation)
    const paramMapping = {
      'hazardCategory': 'problem.hazardCategory',
      'allergen': 'problem.allergen'
    };

    // Forward all query parameters with mapping
    Object.entries(req.query).forEach(([key, value]) => {
      if (value) {
        const mappedKey = paramMapping[key] || key;
        params.append(mappedKey, value);
      }
    });

    const url = `${FSA_BASE_URL}/id?${params.toString()}`;
    log.fsaRequest(url);

    const fsaStartTime = Date.now();
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    const fsaDuration = Date.now() - fsaStartTime;
    log.fsaResponse(response.status, fsaDuration);

    if (!response.ok) {
      const errorBody = await response.text();
      log.error(`FSA API error response body: ${errorBody}`);
      throw new Error(`FSA API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const alertCount = data.items?.length || 0;
    log.info(`Alerts fetched successfully`, { alertCount, totalResults: data.meta?.totalCount });
    res.json(data);
  } catch (error) {
    log.error('Failed to fetch alerts', error);
    res.status(500).json({ error: 'Failed to fetch alerts', message: error.message });
  }
});

// Proxy endpoint for reference data (hazards, allergens, etc.)
app.get('/api/ref/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const url = `${FSA_BASE_URL}/def/${type}`;
    log.info(`Fetching reference data type: ${type}`);
    log.fsaRequest(url);

    const fsaStartTime = Date.now();
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    const fsaDuration = Date.now() - fsaStartTime;
    log.fsaResponse(response.status, fsaDuration);

    if (!response.ok) {
      const errorBody = await response.text();
      log.error(`FSA API error response body: ${errorBody}`);
      throw new Error(`FSA API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const itemCount = data.items?.length || 0;
    log.info(`Reference data fetched successfully`, { type, itemCount });
    res.json(data);
  } catch (error) {
    log.error(`Failed to fetch reference data: ${req.params.type}`, error);
    res.status(500).json({ error: 'Failed to fetch reference data', message: error.message });
  }
});

// Proxy endpoint for alert types
app.get('/api/ref/alert-type', async (req, res) => {
  try {
    const url = `${FSA_BASE_URL}/def/alert-type`;
    log.info('Fetching alert types');
    log.fsaRequest(url);

    const fsaStartTime = Date.now();
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    const fsaDuration = Date.now() - fsaStartTime;
    log.fsaResponse(response.status, fsaDuration);

    if (!response.ok) {
      const errorBody = await response.text();
      log.error(`FSA API error response body: ${errorBody}`);
      throw new Error(`FSA API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const itemCount = data.items?.length || 0;
    log.info(`Alert types fetched successfully`, { itemCount });
    res.json(data);
  } catch (error) {
    log.error('Failed to fetch alert types', error);
    res.status(500).json({ error: 'Failed to fetch alert types', message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  log.info('Health check requested');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  log.info(`FSA API Proxy server started`, { port: PORT, fsaBaseUrl: FSA_BASE_URL });
  console.log('='.repeat(60));
  console.log(`  FSA API Proxy server running on http://localhost:${PORT}`);
  console.log(`  Proxying requests to: ${FSA_BASE_URL}`);
  console.log('='.repeat(60));
});
