let fs = require(`fs`);
let archivo=process.argv[2];
archivo=fs.readFileSync(archivo,'utf-8');

console.log(archivo.charCodeAt(0))
