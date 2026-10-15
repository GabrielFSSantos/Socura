const fs = require('fs');

const shellPath = process.argv[2];
const indexPath = process.argv[3];
const minifiedCodePath = process.argv[4];

if (!shellPath || !indexPath || !minifiedCodePath) {
  console.error('Usage: node update-index.js <index.shell.html> <index.html> <dist/dist.js>');
  process.exit(1);
}

const CODE_BLOCK_START = 'const instagramScript = "';
const CODE_BLOCK_END = '";//__END_OF_SCRIPT__';

const replaceRange = (s, start, end, substitute) => {
  return s.substring(0, start) + substitute + s.substring(end);
};

const indexData = fs.readFileSync(shellPath, { encoding: 'utf8', flag: 'r' });
let minifiedCode = fs.readFileSync(minifiedCodePath, { encoding: 'utf8', flag: 'r' });
const replaceStartIndex = indexData.indexOf(CODE_BLOCK_START) + CODE_BLOCK_START.length;
const replaceEndIndex = indexData.lastIndexOf(CODE_BLOCK_END);

if (replaceStartIndex < CODE_BLOCK_START.length || replaceEndIndex < 0) {
  console.error('Could not find instagramScript markers in shell HTML');
  process.exit(1);
}

minifiedCode = minifiedCode
  .replace(/\\/g, '\\\\')
  .replace(/"/g, '\\"')
  .replace(/\n/g, '\\n')
  .replace(/\r/g, '\\r')
  .replace(/\t/g, '\\t')
  .replace(/\f/g, '\\f');

const parsedReadme = replaceRange(indexData, replaceStartIndex, replaceEndIndex, minifiedCode);
fs.writeFileSync(indexPath, parsedReadme);
