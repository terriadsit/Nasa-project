// ideally, controllers focus on working with request and response
const { getAllPlanets } = require('../../models/planets.model')

async function httpGetAllPlanets(req, res) {
    console.log('in httpgetallplanets')
    return res.status(200).json(await getAllPlanets()); // return to be explicit, not setting headers twice wh/ is an error
}

module.exports = {
    httpGetAllPlanets
};