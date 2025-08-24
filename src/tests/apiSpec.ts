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
      expect(response.text).toEqual("Please provide a valid filename");
    });
  it('Should return Not valid width ', async () => {
    const response = await request.get(
      '/api/images?filename=icelandwaterfall&height=100'
    );
    expect(response.text).toEqual("Please provide a positive numerical value for image width." );
  });
  it('Should return Not valid height ', async () => {
    const response = await request.get(
      '/api/images?filename=icelandwaterfall&height=0&width=500'
    );
    expect(response.text).toEqual("Please provide a positive numerical value for image height." );
  });

  it('POST Should return 200 OK with valid JSON body', async () => {
    const response = await request
      .post('/api/images')
      .send({ filename: 'icelandwaterfall', width: 500, height: 100 })
      .set('Accept', 'application/json');
    expect(response.status).toBe(200);
  });

  it('POST Should return filename error for invalid file', async () => {
    const response = await request
      .post('/api/images')
      .send({ filename: '0', width: 500, height: 100 })
      .set('Accept', 'application/json');
    expect(response.text).toEqual("Please provide a valid filename");
  });

  it('POST Should return width validation error when missing/invalid', async () => {
    const response = await request
      .post('/api/images')
      .send({ filename: 'icelandwaterfall', height: 100 })
      .set('Accept', 'application/json');
    expect(response.text).toEqual("Please provide a positive numerical value for image width.");
  });

  it('POST Should return height validation error when invalid', async () => {
    const response = await request
      .post('/api/images')
      .send({ filename: 'icelandwaterfall', width: 500, height: 0 })
      .set('Accept', 'application/json');
    expect(response.text).toEqual("Please provide a positive numerical value for image height.");
  });
});
