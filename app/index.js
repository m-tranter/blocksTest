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

app.all('/blockstest*', function (_, res) {
  res.sendFile(path.join(dir, '/index.html'));
});

