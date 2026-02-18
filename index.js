/**
 * index.js - Backend Server
 *
 * Express.js server for the FSM Mobile Web Container app.
 * Receives the FSM Mobile POST context, stores it, and serves the UI5 frontend.
 *
 * @file index.js
 * @requires express
 */

const express = require('express');
const path = require('path');

const app = express();

// ===========================
// CONTEXT STORAGE
// ===========================
let mobileAppContext = undefined;

// ===========================
// MIDDLEWARE
// ===========================
app.use((req, res, next) => {
    // Required: allows FSM Mobile WebView to embed this app
    res.removeHeader('X-Frame-Options');
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.enable('trust proxy');

// ===========================
// WEB CONTAINER ENTRY POINT
// ===========================

/**
 * POST /web-container-access-point
 *
 * FSM Mobile sends a POST here when opening the web container.
 * Configure this URL in FSM Admin > Company > Web Containers.
 *
 * Context body contains:
 * { userName, authToken, cloudAccount, companyName, cloudId,
 *   objectType, language, dataCloudFullQualifiedDomainName }
 */
app.post('/web-container-access-point', (req, res) => {
    console.log('Web container opened | user:', req.body?.userName, '| objectType:', req.body?.objectType);
    mobileAppContext = req.body || {};
    res.redirect(req.protocol + '://' + req.get('host'));
});

// Fallback: some FSM versions POST to root
app.post('/', (req, res) => {
    mobileAppContext = req.body || {};
    res.redirect(req.protocol + '://' + req.get('host'));
});

/**
 * GET /web-container-context
 *
 * Frontend calls this on load to retrieve the stored mobile context.
 * Returns 404 if the app was opened directly in a browser.
 */
app.get('/web-container-context', (req, res) => {
    if (mobileAppContext === undefined) {
        return res.status(404).json({ message: 'No mobile context available.' });
    }
    return res.json(mobileAppContext);
});

// ===========================
// STATIC FILES (UI5 frontend)
// ===========================
app.use(express.static(path.join(__dirname, 'webapp')));

// ===========================
// START SERVER
// ===========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`FSM Web Container app running on port ${PORT}`);
});