const { program } = require('commander');
const { start } = require('../server')

program
  .option('-P, --port <port>');

program.parse();

const options = program.opts();
const port = options.port ?? 8080;

start(port)