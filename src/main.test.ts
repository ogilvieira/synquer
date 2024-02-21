import { Synquer } from "./main";
import fs from 'fs';
import path, { resolve } from 'path';
import crypto from 'crypto';
import util from 'util';


const fakePromise = (callback: Function, timeout: number = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const r = callback();
      resolve(r);
    }, timeout)
  });
}

test('Execute in exactly sequence', async () => {
  try {     

    const queue = new Synquer();
    let NUMBER = 0;

    const res = await Promise.all([
      queue.execute(() => fakePromise(() => {
        NUMBER++;
        return `${NUMBER}-A`;
      }, 1500)),
      queue.execute( () => fakePromise(() => {
        NUMBER++;
        return `${NUMBER}-B`;
      }, 1000)),
      queue.execute( () => fakePromise(() => {
        NUMBER++;
        return `${NUMBER}-C`;
      }, 500))
    ]);

    expect(res).toStrictEqual(['1-A', '2-B', '3-C']);

  } catch(error) {
    console.error(error);
    expect(error).toBeNull();
  }
 
});


test('Write and delete files on sequence', async () => {
  try {

    const TEST_FOLDER = path.resolve(__dirname, '../.tmp-test');

    const randomStr = (size = 5) => {
      return crypto.randomBytes(size).toString('hex');
    }

    if( fs.existsSync(TEST_FOLDER) ) {
      fs.rmSync(TEST_FOLDER, { recursive: true })
    }
    
    const writeFileQueue = new Synquer();
    const writeFileAsync = util.promisify(fs.writeFile);
    
    await Promise.all([
      writeFileQueue.execute(() => fs.mkdirSync(TEST_FOLDER)),
      writeFileQueue.execute(() => writeFileAsync(
        `${TEST_FOLDER}/A`, 
        randomStr(500)
      )),
      writeFileQueue.execute(() => writeFileAsync(
        `${TEST_FOLDER}/B`, 
        randomStr(500)
      )),
      writeFileQueue.execute(() => fs.rmSync(TEST_FOLDER, { recursive: true })),
      writeFileQueue.execute(() => fs.mkdirSync(TEST_FOLDER)),
      writeFileQueue.execute(() => writeFileAsync(
        `${TEST_FOLDER}/C`, 
        randomStr(10)
      )),
      writeFileQueue.execute(() => writeFileAsync(
        `${TEST_FOLDER}/D`, 
        randomStr(10)
      )),
      writeFileQueue.execute(() => writeFileAsync(
        `${TEST_FOLDER}/E`, 
        randomStr(10)
      )),
    ]);

    const files = await (util.promisify(fs.readdir))(TEST_FOLDER);
    expect(files.sort()).toStrictEqual(['C', 'D', 'E']);

    if( fs.existsSync(TEST_FOLDER) ) {
      fs.rmSync(TEST_FOLDER, { recursive: true })
    }
      
  } catch(error) {
    console.error(error);
    expect(error).toBeNull();
  }
 
});

test('Catch a error when reject without draining', async () => {
  try {

    const queue = new Synquer();

    await Promise.all([
      queue.execute(() => new Promise((_, reject) => {
        reject('error');
      }))
    ]);

  } catch(error) {
    expect(error).toMatch('error');
  }

});

test('Catch a error when reject with draining', async () => {
  try {

    const queue = new Synquer();

    await Promise.all([
      queue.execute(() => new Promise((resolve, _) => {
        setTimeout(() => {
          resolve(1);
        }, 1000);
      })),
      queue.execute(() => new Promise((_, reject) => {
        reject('error');
      }))
    ]);

  } catch(error) {
    console.log(error);
    expect(error).toMatch('error');
  }

});