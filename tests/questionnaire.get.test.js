const request = require('supertest');
const app = require('../index');
const questionnaire = require('../models/questionnaire');

describe('GET /questionnaire', () => {
    it('should get a user preference', async () => {
        // Simulate a request with a valid JWT token
        const res = await request(app)
            .get('/questionnaire')
            .set('Authorization', 'Bearer validJWTToken');

        // Check if the response is successful
        expect(res.statusCode).toEqual(200);
        // Check if the response contains the user preference
        expect(res.body).toHaveProperty('question1');
        expect(res.body).toHaveProperty('question2');
        expect(res.body).toHaveProperty('question3');
        expect(res.body).toHaveProperty('question4');
    });

    it('should return an error for missing JWT token', async () => {
        // Simulate a request without a JWT token
        const res = await request(app)
            .get('/questionnaire');

        // Check if the response status is not successful (e.g., 401 for unauthorized)
        expect(res.statusCode).not.toEqual(200);
        expect(res.body).toHaveProperty('message');
    });
});
