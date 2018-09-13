const fs = require('fs');

let readData = fs.readFileSync('./a.txt');

console.log(readData.toString());