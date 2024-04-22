const request = require('supertest');
const app = require('../index');
const questionnaire = require('../models/questionnaire');

describe('POST /questionnaire', () => {
    it('should create a user preference and return it', async () => {
        // Simulate a request with a valid JWT token
        const res = await request(app)
            .post('/questionnaire')
            .set('Authorization', 'Bearer validJWTToken')
            .send({
                question1: 'answer1',
                question2: 'answer2',
                question3: 'answer3',
                question4: 'answer4',
            });

        // Check if the response is successful
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('userPref');


        // Clean up: delete the created user preference from the database
        await questionnaire.deleteOne({ _id: res.body.userPref._id });
    });

    it('should return an error for missing JWT token', async () => {
        // Simulate a request without a JWT token
        const res = await request(app)
            .post('/questionnaire')
            .send({
                question1: 'answer1',
                question2: 'answer2',
                question3: 'answer3',
                question4: 'answer4',

            });

        // Check if the response status is not successful (e.g., 401 for unauthorized)
        expect(res.statusCode).not.toEqual(200);
        expect(res.body).toHaveProperty('message');
    });
});
