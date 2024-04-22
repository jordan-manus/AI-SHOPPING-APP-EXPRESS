const request = require('supertest');
const app = require('../index');
const fs = require('fs');

jest.mock('request', () => jest.fn());

describe('PUT /findItem', () => {
    it('should find an item in an image', async () => {
        // Mock the request to OpenAI API
        request.mockImplementation((options, callback) => {
            const response = { statusCode: 200, body: { result: 'Mocked result' } };
            callback(null, response, response.body);
        });

        // Simulate a request with a valid JWT token and image data
        const res = await request(app)
            .put('/findItem')
            .set('Authorization', 'Bearer validJWTToken')
            .send({
                image: 'path/to/image.jpg',
            });

        // Check if the response is successful
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('result', 'Mocked result');
    });

    it('should return an error for missing JWT token', async () => {
        // Simulate a request without a JWT token
        const res = await request(app)
            .put('/findItem')
            .send({
                image: 'path/to/image.jpg',
            });

        // Check if the response status is not successful (e.g., 401 for unauthorized)
        expect(res.statusCode).not.toEqual(200);
        expect(res.body).toHaveProperty('message');
    });
});
