import supertest from 'supertest';
import { app } from '../index';

const request = supertest(app);

describe('Test endpoint responses', () => {
    it('Should return 200 OK (Image API works, local file)', async () => {
        const response = await request.get(
            '/api/images?filename=icelandwaterfall&height=100&width=500'
        );
        expect(response.status).toBe(200);
    });

    it('Should return 404 when local image does not exist', async () => {
        const response = await request.get(
            '/api/images?filename=nonexistentfile000&height=100&width=500'
        );
        expect(response.status).toBe(404);
    });

    it('Should return 400 when width missing', async () => {
        const response = await request.get(
            '/api/images?filename=icelandwaterfall&height=100'
        );
        expect(response.status).toBe(400);
    });

    it('Should return 400 when height invalid', async () => {
        const response = await request.get(
            '/api/images?filename=icelandwaterfall&height=0&width=500'
        );
        expect(response.status).toBe(400);
    });

    it('Should return 400 when neither key nor filename provided', async () => {
        const response = await request.get('/api/images?width=100&height=100');
        expect(response.status).toBe(400);
    });

    it('Should return 400 when key fails prefix validation', async () => {
        const response = await request.get(
            '/api/images?key=etc/passwd&width=100&height=100'
        );
        expect(response.status).toBe(400);
    });

    it('Should return 500 when key is valid prefix but S3 is not configured', async () => {
        const response = await request.get(
            '/api/images?key=uploads/missing-from-s3.png&width=100&height=100'
        );
        expect(response.status).toBe(500);
    });
});
