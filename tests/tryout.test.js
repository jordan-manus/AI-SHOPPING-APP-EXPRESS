const request = require('supertest');
const app = require('../index');
const openai = require('openai');
const fs = require('fs');

jest.mock('openai', () => ({
    images: {
        edit: jest.fn().mockResolvedValue({
            data: [{ url: 'mockedImageUrl' }]
        })
    }
}));

jest.mock('fs', () => ({
    createReadStream: jest.fn().mockReturnValue('mockedReadStream')
}));

describe('PUT /tryon', () => {
    it('should edit an image and return the edited image URL', async () => {
        // Simulate a request with a valid JWT token
        const res = await request(app)
            .put('/tryon')
            .set('Authorization', 'Bearer validJWTToken')
            .send({
                selfie: 'path/to/selfie.jpg',
                item_name: 'referenceItem'
            });

        // Check if the response is successful
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('image_url', 'mockedImageUrl');
    });

    it('should return an error for missing JWT token', async () => {
        // Simulate a request without a JWT token
        const res = await request(app)
            .put('/tryon')
            .send({
                selfie: 'path/to/selfie.jpg',
                item_name: 'referenceItem'
            });

        // Check if the response status is not successful (e.g., 401 for unauthorized)
        expect(res.statusCode).not.toEqual(200);
        expect(res.body).toHaveProperty('message');
    });
});
