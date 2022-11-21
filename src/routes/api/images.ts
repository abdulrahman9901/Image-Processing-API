import express from 'express';
import sharp from 'sharp';
import { promises as fsPromises } from 'fs';
import { Request, Response } from 'express';

const images = express.Router();

images.get('/images', function (req: Request, res: Response): void {
  const filename: string = req.query.filename;
  const height: number = +req.query.height;
  const width: number = +req.query.width;

  const sendImage = (res: Response, image: Buffer): void => {
    res.setHeader('Content-Type', 'image/jpg');
    res.setHeader('Content-Length', ''); // Image size here
    res.setHeader('Access-Control-Allow-Origin', '*'); // If needs to be public
    res.send(image);
  };

  fsPromises
    .readFile(`./assets/full/${filename}.jpg`)
    .then(() => {
      const OriginalImage = sharp(`./assets/full/${filename}.jpg`);
      if (height <= 0 || width <= 0) {
        res.send('Not valid dimension');
      }
      fsPromises
        .readFile(`./assets/thumb/${filename}-thumb.jpg`)
        .then((image) => {
          const img = sharp(image);
          img
            .metadata()
            .then((data) => {
              return data;
            })
            .then((info) => {
              if ((info.width == width, info.height == height)) {
                console.log('Already processed');

                sendImage(res, image);
              } else {
                OriginalImage.resize(width, height)
                  .toFile(`./assets/thumb/${filename}-thumb.jpg`)
                  .then(async () => {
                    console.log(
                      'Already processed but with different dimensions'
                    );

                    const myFile = await fsPromises.readFile(
                      `./assets/thumb/${filename}-thumb.jpg`
                    );

                    sendImage(res, myFile);
                  });
              }
            });
        })
        .catch(() =>
          OriginalImage.resize(width, height)
            .toFile(`./assets/thumb/${filename}-thumb.jpg`)
            .then(async () => {
              console.log('not processed .');

              const myFile = await fsPromises.readFile(
                `./assets/thumb/${filename}-thumb.jpg`
              );

              sendImage(res, myFile);
            })
            .catch(() => {
              res.send('Not valid dimension');
            })
        );
    })
    .catch(() => {
      res.status(404);
      res.send('Image Not Found');
    });
});

export default images;
