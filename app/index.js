'use strict';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import getEntries from './getEntries.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../public');
const server = express();
const port = 3001;

server.listen(port, (error) => {
  if (!error) {
    console.log(`\nServer running on port ${port}.`);
  } else {
    console.log(error);
  }
});

const myLogger = function (req, _, next) {
  console.log(`Incoming: ${req.url}`);
  next();
};

server.use(express.json());
server.use(myLogger);
server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, '../views'));

server.get(/.*\.(js|css)$/, (req, res) => {
  const filePath = path.join(dir, req.url);
  res.sendFile(filePath);
});

server.get('*', (req, res) => {
  getEntries(req, res);
});
