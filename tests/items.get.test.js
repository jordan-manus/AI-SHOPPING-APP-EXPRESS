const request = require('supertest');
const app = require('../index');
const items = require('../models/items');

describe('GET /items', () => {
    it('should get items for the logged-in user', async () => {
        // Simulate a request with a valid JWT token
        const res = await request(app)
            .get('/items')
            .set('Authorization', 'Bearer validJWTToken');

        // Check if the response is successful
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('myItems');

    });

    it('should return an error for missing JWT token', async () => {
        // Simulate a request without a JWT token
        const res = await request(app)
            .get('/items');

        // Check if the response status is not successful (e.g., 401 for unauthorized)
        expect(res.statusCode).not.toEqual(200);
        expect(res.body).toHaveProperty('message');
    });
});
