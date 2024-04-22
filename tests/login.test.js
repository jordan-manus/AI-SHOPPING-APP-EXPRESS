const request = require('supertest');
const app = require('../index');
const User = require('../models/users');

describe('POST /login', () => {
    it('should log in a user and return a token', async () => {
        // First, create a user for testing purposes
        const testUser = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'testpassword'
        });

        // simulate a login request
        const res = await request(app)
            .post('/login')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });

        // Check if the response is successful
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('userId');


        await User.findByIdAndDelete(testUser._id);
    });

    it('should return an error for invalid credentials', async () => {
        // Simulate a login request with invalid credentials
        const res = await request(app)
            .post('/login')
            .send({
                username: 'nonexistentuser',
                password: 'invalidpassword'
            });

        // Check if the response status is not successful (e.g., 401 for unauthorized)
        expect(res.statusCode).not.toEqual(200);
        expect(res.body).toHaveProperty('message');
    });
});
