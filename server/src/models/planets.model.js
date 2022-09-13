// ideally, models give data access functions wh/ control how the data 
// in the model can be written to and read, provides data access functions
// manipulates planets data into a usable form for preload
const { parse }  = require('csv-parse');
const fs = require('fs');
const path = require('path');

const planets = require('./planets.mongo');

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
      && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
      && planet['koi_prad'] < 1.6;
}

async function getAllPlanets() {
  // first argument is a filter, second wh/ fields
  return await planets.find({}, {
    '__v': 0, //exclude __v (version field)
    '_id': 0
  });
}

// pipe function connects a readable stream source
// with a writable stream destination, readable.pipe(writable)

// this is happening asyncronsly
function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname,'..','..','data','kepler_data.csv'))
    .pipe(parse({     // parse creates a js object
      comment: '#',
      columns: true, // columns option sets each row to a javascript object with key value pairs
   }))
   .on('data', async (data) => {
      if (isHabitablePlanet(data)) {
        savePlanet(data);
      }
    })
    .on('error', (err) => {
      console.log(err);
      reject(err);
    })
    .on('end', async () => {
      const countPlanetsFound = (await getAllPlanets()).length;
      console.log(`${countPlanetsFound} possible planets` );
      resolve();
    });
    
  });
}


async function savePlanet(planet) {
  // insert + update = upsert when object does not already exist, save only once
  // find first argument if it exists, if not, insert 2nd argument
  try {
    await planets.updateOne({
      keplerName: planet.kepler_name,
    }, {
      keplerName: planet.kepler_name,
    }, {
      upsert: true,
    });
  } catch(err) {
    console.error(`Could not save planet ${err}`);
  }
}


module.exports = {
    loadPlanetsData,
    getAllPlanets,
};
  