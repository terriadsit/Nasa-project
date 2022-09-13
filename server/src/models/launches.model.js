const launchesDataBase = require('./launches.mongo')
const planets = require('./planets.mongo'); // not .model, in general, communicate with files a layer below current layer

const DEFAULT_FLIGHT_NUMBER = 100;

//const launches = new Map();

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
// set key, value, a javascript Map object
//launches.set(launch.flightNumber, launch);
// now can access by key, ex. launches.get(100);

async function saveLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if (!planet) {
        throw new Error('No matching planet was found')
    }

    await launchesDataBase.findOneAndUpdate({
      flightNumber: launch.flightNumber, // update if flight already exists 
    }, launch, { // what to update or add
        upsert: true,   
    })
}

async function scheduleNewLaunch(launch) {
    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
                    customers: ['ZTM', 'NASA'],
                    upcoming: true,
                    success: true,
                    flightNumber: newFlightNumber,
               });

    await saveLaunch(newLaunch);
}

// Object.assign allows us to assign additional properties to launch
// overwriting launch properties if in lauch
// function addNewLaunch(launch) {
//     latestFlightNumber++;
//     launches.set(
//         latestFlightNumber, 
//         Object.assign(launch, {
//             customers: ['ZTM', 'NASA'],
//             upcoming: true,
//             success: true,
//             flightNumber: latestFlightNumber,
//        })
//     );
// }

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDataBase
      .findOne()
      .sort('-flightNumber');  // lowest to hightest is default,"-" reverses, return first
    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
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

async function existsLaunchWithId(launchId) {
    return await launchesDataBase.findOne({
        flightNumber: launchId
    })
   //return launches.has(launchId);
}

async function abortLaunchById(launchId) {
    // const aborted = launches.get(launchId);
    // aborted.upcoming = false;
    // aborted.success = false;
    // return aborted;
    const aborted = await launchesDataBase.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false,
    });

    return aborted.acknowledged && aborted.modifiedCount === 1;
}

module.exports = {
    getAllLaunches, 
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById,
};