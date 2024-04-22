const request = require('supertest');
const app = require('../index');
const Blacklist = require('../models/blacklist');

describe('GET /logout', () => {
    it('should log out a user and blacklist the token', async () => {
        // Simulate a request with a valid authorization token
        const res = await request(app)
            .get('/logout')
            .set('Authorization', 'Bearer validAccessToken');

        // Check if the response is successful
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Successfully logged out');
        const blacklistedToken = await Blacklist.findOne({ token: 'validAccessToken' });
        expect(blacklistedToken).toBeTruthy();


        await Blacklist.findByIdAndDelete(blacklistedToken._id);
    });

    it('should return an error for missing authorization token', async () => {
        // Simulate a request without an authorization token
        const res = await request(app)
            .get('/logout');

        // Check if the response status is not successful (e.g., 400 for bad request)
        expect(res.statusCode).not.toEqual(200);
        expect(res.body).toHaveProperty('message', 'No authorization token');
    });
});
