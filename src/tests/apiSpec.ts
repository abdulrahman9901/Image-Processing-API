import supertest from 'supertest';
import {app} from '../index';

const request = supertest(app);

describe('Test endpoint responses', () => {
    it('gets the api endpoint', async () => {
        const response = await request.get('/api/images?filename=0&height=1&width=3');
        expect(response.status).toBe(200);
    }
)});