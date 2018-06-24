const yargs = require("yargs");
const bootstrap = require("../lib");

const argv = yargs
  .option("base", {
    type: "string",
    describe: "the base path where the server will be mounted",
    default: process.cwd(),
  })
  .option("host", {
    type: "string",
    default: "localhost",
    describe: "the host the server will listen to",
  })
  .option("port", {
    type: "number",
    default: 3000,
    describe: "the port the server will listen to",
  }).argv;

bootstrap(argv);
