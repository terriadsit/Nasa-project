const express = require('express');

const planetsRouter = require('./planets/planets.router')
const launchesRouter = require('./launches/launches.router')

const api = express.Router()

// contains our routes would have different api.js for different versions of this project
api.use('/planets', planetsRouter);
// express allows you to mount middleware on a specific path
api.use('/launches', launchesRouter);

module.exports = api;
