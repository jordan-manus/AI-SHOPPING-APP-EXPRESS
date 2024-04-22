const request = require('supertest');
const app = require('../index');

describe('POST /register', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'testpassword'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('username', 'testuser');
        expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });
});
