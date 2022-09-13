// controller manipulates data into a form that can be returned to the front end
const { 
    getAllLaunches, 
    addNewLaunch,
    existsLaunchWithId,
    abortLaunchById, 
} = require('../../models/launches.model');

// convention: any function beginning http returns a response
async function httpGetAllLaunches(req, res) {
    return res.status(200).json(await getAllLaunches());
}

function httpAddNewLaunch(req, res) {
    // because middleware in app.js, receive req as parsed json
    const launch = req.body;
     // error if missing any data
    if (!launch.launchDate || !launch.rocket || !launch.mission || !launch.target) {
        return res.status(400).json({
            error: 'missing launch data'
        });
    } else {
        // json sends in dates as strings, turn it into a date object
        launch.launchDate  = new Date(launch.launchDate);
        if (isNaN(launch.launchDate)) {
            return res.status(400).json({
                error: 'invalid launch date'
            });      
        }
        addNewLaunch(launch);
        // return data so user knows all data was processed in backend
        return res.status(201).json(launch);
    }
}

function httpAbortLaunch(req, res) {
    // params is a string, convert to a number for as Map key is a number
    const launchId = Number(req.params.id)
    const exist = existsLaunchWithId(launchId)

    // if launch not found
    if (!exist) {
      return res.status(404).json({
        error: 'launch not found',
      });
    }
    // if launch is found
    const aborted = abortLaunchById(launchId);
    return res.status(200).json(aborted);
    
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
}