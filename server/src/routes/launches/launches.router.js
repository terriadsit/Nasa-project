const express = require('express');

const { 
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch, 
} = require('./launches.controller');

const launchesRouter = express.Router();

// '/launch' path set in app.js
launchesRouter.get('/', httpGetAllLaunches);
launchesRouter.post('/', httpAddNewLaunch);
launchesRouter.delete('/:id', httpAbortLaunch)


module.exports = launchesRouter;