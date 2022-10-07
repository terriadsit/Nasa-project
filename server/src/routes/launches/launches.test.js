const { mongoConnect, 
        mongoDisconnect,
} = require('../../services/mongo');
const request = require('supertest'); //installed supertest in npm
const app = require('../../app');
const { loadPlanetsData } = require('../../models/planets.model');

// need mongoConnect, loadPlanetsData because server is never called
describe('Launches API',() => {
    beforeAll(async () => {
        await mongoConnect();
        await loadPlanetsData();
    });

    afterAll(async () => {
        await mongoDisconnect();
    })

    describe('Test GET /launches', () => {
        test('It should respond with 200 success', async () => {
           const response = await request(app)
             .get('/v1/launches') //request calls the listen function on app
             .expect('Content-Type', /json/) // supertest assertions to check response
             .expect(200);
        });
    });
    
    describe('Test POST /v1/launch', () => {
    
        const completeLaunchData = {
            mission: 'USS enterprise',
            rocket: 'NCC 100-D',
            target: 'Kepler-1652 b',
            launchDate: 'January 4, 2028',
        };
    
        const launchDataWithoutDate = {
            mission: 'USS enterprise',
            rocket: 'NCC 100-D',
            target: 'Kepler-1652 b',
         };
    
         const launchDataWithInvalidDate = {
            mission: 'USS enterprise',
            rocket: 'NCC 100-D',
            target: 'Kepler-1652 b',
            launchDate: 'hello',
        };
    
        test('It should respond with 201 created success', async () => {
            const response = await request(app)
            .post('/v1/launches')
            .send(completeLaunchData)
            .expect('Content-Type', /json/)
            .expect(201);
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
    
            //jest assertions to check body
            expect(response.body).toMatchObject(launchDataWithoutDate)
        });
    
        test('It should catch missing required properties', async () => {
            const response = await request(app)
            .post('/v1/launches')
            .send(launchDataWithoutDate)
            .expect('Content-Type', /json/)
            .expect(400);
    
            expect(response.body).toStrictEqual({
                error: 'missing launch data'
            });
        });
    
        test('It should catch invalid dates', async () => {
            const response = await request(app)
            .post('/v1/launches')
            .send(launchDataWithInvalidDate)
            .expect('Content-Type', /json/)
            .expect(400);
    
            expect(response.body).toStrictEqual({
                error: 'invalid launch date'
            });
    });
})


});