// contains all of our express code used for multiple routers
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const planetsRouter = require('./routes/planets/planets.router')
const launchesRouter = require('./routes/launches/launches.router')

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

app.use('/planets', planetsRouter);
// express allows you to mount middleware on a specific path
app.use('/launches', launchesRouter);

// Send routes other than those above through Client index.html in public build
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..','public', 'index.html'));
})

module.exports = app;