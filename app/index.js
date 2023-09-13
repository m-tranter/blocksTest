'use strict';


import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const dir = path.join(__dirname, '../public');
const port = 3001;

app.listen(port, (error) => {
	if(!error) {
		console.log(`\nServer running on port ${port}.`);
	} else {
		console.log(error);
		}
	}
);

// Log all requests to the server.
const myLogger = function (req, _, next) {
    console.log(`Incoming: ${req.url}`);
  next();
};

// Middleware
app.use(express.json());
app.use(express.static(dir));
app.use(myLogger);

app.all('/blockstest*', function (req, res) {
    res.send(`
<head>
  <meta charset="UTF-8"/>
  <link rel="stylesheet" href="style.css">
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Express test</title>
</head>
<body>
  <h1>Express test</h1>
      <div id="app">${req.url.includes('?') ? req.url.split('?')[1]: "No query string received"}</div>
      </body>
      </html>
      `);
});

