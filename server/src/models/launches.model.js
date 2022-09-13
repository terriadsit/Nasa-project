const launchesDataBase = require('./launches.mongo')
const launches = new Map();

let latestFlightNumber = 100;

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customers: ['ZTM', 'NASA'],
    upcoming: true,
    success: true, 
};

saveLaunch(launch);
// set key, value
//launches.set(launch.flightNumber, launch);
// now can access by key, ex. launches.get(100);

async function saveLaunch(launch) {
    await launchesDataBase.updateOne({
      flightNumber: launch.flightNumber, // update if flight already exists 
    }, launch, { // what to update or add
        upsert: true,   
    })
}


// Object.assign allows us to assign additional properties to launch
// overwriting launch properties if in lauch
function addNewLaunch(launch) {
    latestFlightNumber++;
    launches.set(
        latestFlightNumber, 
        Object.assign(launch, {
            customers: ['ZTM', 'NASA'],
            upcoming: true,
            success: true,
            flightNumber: latestFlightNumber,
       })
    );
}

//map.values() returns iterable values wh/ can be turned into an array
async function getAllLaunches() {
    return await launchesDataBase.find({}, {
        '__v': 0, //exclude __v (version field)
        '_id': 0
      });
    // console.log('in get all launches')
    // return Array.from(launches.values())
}

function existsLaunchWithId(launchId) {
   return launches.has(launchId);
}

function abortLaunchById(launchId) {
    const aborted = launches.get(launchId);
    aborted.upcoming = false;
    aborted.success = false;
    return aborted;
}

module.exports = {
    getAllLaunches, 
    addNewLaunch,
    existsLaunchWithId,
    abortLaunchById,
};