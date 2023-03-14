
const express = require('express');
const path = require('path');
const app = express();
const dir = path.join(__dirname, '../public');
const port = 3001;

app.listen(port, (error) =>{
	if(!error)
		console.log(`\nServer running on port ${port}.`);
		console.log(`\nBlock running: ${new Date().toLocaleString()}`);
	else
		console.log(error);
	}
);

app.use(express.static(dir));
