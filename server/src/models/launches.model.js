const axios = require('axios')
const launchesDataBase = require('./launches.mongo')
const planets = require('./planets.mongo') // not .model, in general, communicate with files a layer below current layer

const DEFAULT_FLIGHT_NUMBER = 100

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunches () {
  console.log('downloading launch data from spacex api')
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1
          }
        },
        {
          path: 'payloads',
          select: {
            customers: 1
          }
        }
      ]
    }
  });

  if (response.status !== 200) {
    console.log('Problem downloading launch data.');
    throw new Error ('Launch data download failed');
  }

  const launchDocs = response.data.docs
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc.payloads // array of payloads each containing an array of customers
    const payloadCustomers = payloads.flatMap(payload => payload['customers'])
    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      target: '', // not applicable
      customers: payloadCustomers,
      upcoming: launchDoc.upcoming,
      success: launchDoc.success
    }
    console.log(launch.flightNumber, launch.rocket, launch.customers)
    await saveLaunch(launch)
  }
}

async function loadLaunchesData () {
  // only load db once
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat'
  })
  if (firstLaunch) {
    console.log('Launch data already loaded!')
  } else {
    await populateLaunches()
  }
}
// set key, value, a javascript Map object
//launches.set(launch.flightNumber, launch);
// now can access by key, ex. launches.get(100);

async function saveLaunch (launch) {
  await launchesDataBase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber // update if flight already exists
    },
    launch,
    {
      // what to update or add
      upsert: true
    }
  )
}

async function scheduleNewLaunch (launch) {
  const planet = await planets.findOne({
    keplerName: launch.target
  });

  if (!planet) {
    throw new Error('No matching planet was found')
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1
  const newLaunch = Object.assign(launch, {
    customers: ['ZTM', 'NASA'],
    upcoming: true,
    success: true,
    flightNumber: newFlightNumber
  })

  await saveLaunch(newLaunch)
}



async function getLatestFlightNumber () {
  const latestLaunch = await launchesDataBase.findOne().sort('-flightNumber') // lowest to hightest is default,"-" reverses, return first
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER
  }
  return latestLaunch.flightNumber
}

//map.values() returns iterable values wh/ can be turned into an array
async function getAllLaunches (skip, limit) {
  return await launchesDataBase
    .find({},
       {
        __v: 0, //exclude __v (version field)
        _id: 0
       }
    )
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
  // console.log('in get all launches')
  // return Array.from(launches.values())
}

async function findLaunch (filter) {
  return await launchesDataBase.findOne(filter)
}

async function existsLaunchWithId (launchId) {
  return await findLaunch({
    flightNumber: launchId
  })
  //return launches.has(launchId);
}

async function abortLaunchById (launchId) {
  // const aborted = launches.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
  const aborted = await launchesDataBase.updateOne(
    {
      flightNumber: launchId
    },
    {
      upcoming: false,
      success: false
    }
  )

  return aborted.acknowledged && aborted.modifiedCount === 1
}

module.exports = {
  loadLaunchesData,
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById
}
