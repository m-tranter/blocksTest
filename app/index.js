
const express = require('express');
const path = require('path');
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
app.use(myLogger);

app.all('*', function(req, res) {
  res.sendFile(path.join(dir, '/index.html'));
});
