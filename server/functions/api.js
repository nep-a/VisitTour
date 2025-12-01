const serverless = require('serverless-http');
const app = require('../index'); // Import the express app from index.js

// We need to export the handler from index.js directly, 
// but since index.js is currently structured as a main entry file, 
// we are using the one exported there.
// However, Netlify expects the function file to be in a specific place or configured.
// We will point Netlify to use `server/index.js` as the function handler if possible,
// or create a wrapper here.

// Actually, the easiest way is to point the netlify.toml functions directory to a folder
// containing this file, which imports the app.

module.exports.handler = app.handler;
