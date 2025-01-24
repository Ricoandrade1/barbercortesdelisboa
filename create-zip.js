const fs = require('fs');
const archiver = require('archiver');

const output = fs.createWriteStream('project.zip');
const archive = archiver('zip', {
  zlib: { level: 9 }
});

output.on('close', () => {
  console.log('Project has been zipped!');
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory('./', false);
archive.finalize();
