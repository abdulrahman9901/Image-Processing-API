import supertest from 'supertest';
import { app } from '../index';

const request = supertest(app);

describe('Test endpoint responses', () => {
  it('Should return 200 OK (Image API works)', async () => {
    const response = await request.get(
      '/api/images?filename=icelandwaterfall&height=100&width=500'
    );
    expect(response.status).toBe(200);
  }),
    it('Should return 404 Not Found (Image Not Found )', async () => {
      const response = await request.get(
        '/api/images?filename=0&height=100&width=500'
      );
      expect(response.status).toBe(404);
    });
  it('Should return Not valid dimension ', async () => {
    const response = await request.get(
      '/api/images?filename=icelandwaterfall&height=0&width=500'
    );
    expect(response.status).toBe(200);
  });
});
