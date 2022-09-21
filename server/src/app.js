// contains all of our express code used for multiple routers
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const api = require('./routes/api');

const app = express();

// all the express middleware 
app.use(cors({
    origin: 'http://localhost:3001'
}));

//manage logs of requests, use combined format
app.use(morgan('combined'));

app.use(express.json()); // parse json'
// client production build accessed by static
app.use(express.static(path.join(__dirname, '..', 'public' )))

//allows us to support multiple version of our api
app.use('/v1', api);

// Send routes other than those above through Client index.html in public build
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..','public', 'index.html'));
})

module.exports = app;