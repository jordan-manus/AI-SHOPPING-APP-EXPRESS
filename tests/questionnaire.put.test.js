const request = require('supertest');
const app = require('../index');
const questionnaire = require('../models/questionnaire');

describe('PUT /questionnaire', () => {
    it('should update a user preference', async () => {
        // Simulate a request with a valid JWT token
        const res = await request(app)
            .put('/questionnaire')
            .set('Authorization', 'Bearer validJWTToken')
            .send({
                question1: 'updatedAnswer1',
                question2: 'updatedAnswer2',
                question3: 'updatedAnswer3',
                question4: 'updatedAnswer4',

            });

        // Check if the response is successful
        expect(res.statusCode).toEqual(200);
        // Check if the response contains the updated user preference
        expect(res.body).toHaveProperty('question1', 'updatedAnswer1');
        expect(res.body).toHaveProperty('question2', 'updatedAnswer2');
        expect(res.body).toHaveProperty('question2', 'updatedAnswer3');
        expect(res.body).toHaveProperty('question2', 'updatedAnswer4');

    });

    it('should return an error for missing JWT token', async () => {
        // Simulate a request without a JWT token
        const res = await request(app)
            .put('/questionnaire')
            .send({
                question1: 'updatedAnswer1',
                question2: 'updatedAnswer2',
                question3: 'updatedAnswer3',
                question4: 'updatedAnswer4',
            });

        // Check if the response status is not successful (e.g., 401 for unauthorized)
        expect(res.statusCode).not.toEqual(200);
        expect(res.body).toHaveProperty('message');
    });
});
