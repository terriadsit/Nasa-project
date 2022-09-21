//const mongoose = require('mongoose');

//const MONGO_URL = 'mongodb+srv://nasa-api:nfLd3l7iGipDWgOv@cluster0.lz04i.mongodb.net/nasa?retryWrites=true&w=majority';


const http = require('http'); //node built in http module

const app = require('./app');

 // put all of our express code into app.js
//input request listener function to createServer wh/ responds to all incoming request to our server, a listener

const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchesData } = require('./models/launches.model')
const { mongoConnect } = require('./services/mongo');

const server = http.createServer(app);

const PORT = process.env.PORT || 8000; // may set env in start script

// load data, Mongo, before server begins responding to requests
async function startServer() {
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchesData();

    server.listen(PORT, () => {
        console.log('listening on port:',PORT)
    });
}

startServer();
