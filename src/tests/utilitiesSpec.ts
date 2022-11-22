import { Imageprocessing } from "../utilities";
import { promises as fsPromises } from 'fs';

describe('Imageprocessing tests ', () => {
    it('should return the image "icelandwaterfall" from assets/full ', async () => {
      expect(await Imageprocessing("icelandwaterfall",NaN,NaN)).toEqual(await fsPromises.readFile(`./assets/full/icelandwaterfall.jpg`));
    });
  });
  