import {getPort} from'../index'

describe("basic test ",()=>{
    it ('should return 3000 ', () => {
        expect(getPort()).toBe(3000);
    });   
})