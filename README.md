![Branches](./badges/coverage-branches.svg)
![Functions](./badges/coverage-functions.svg)
![Lines](./badges/coverage-lines.svg)
![Statements](./badges/coverage-statements.svg)
![Jest coverage](./badges/coverage-jest%20coverage.svg)

Node documentation says:

    It is unsafe to use fs.write() multiple times on the same file without waiting for the callback.
    https://nodejs.org/api/fs.html#fs_fs_write_fd_buffer_offset_length_position_callback

Synquer can be used for sync write calls to the same file.
But Synquer can be used for sync any promises not only write calls.
        
How install:

```bash
npm install synquer
```

# Example

```javascript

const fs = require('fs');
const util = require('util');
const writeAsync = util.promisify(fs.write);


//Wait Queue
const { Synquer } = require('synquer');
//import Synquer from 'synquer';

const write_queue = new Synquer();

async function write(){
    //write in order
    return write_queue.execute(()=> writeAsync(...arguments)); 
}

//now all writes will be queued
await Promise.all([
    write(fd, buffer, offset, length, position),
    write(fd, other_buffer, offset, length, position),
    write(fd, buffer, offset, other_length, other_position)
]);

```
