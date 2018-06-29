const cors = require("cors");
const express = require("express");
const path = require("path");
const signale = require("signale");
const slash = require("slash");
const globby = require("globby");

module.exports = async argv => {
  const basePath = path.resolve(argv.base);
  const filesPath = path.resolve(basePath, "files");

  const app = express();
  const server = require("http").createServer(app);
  const io = require("socket.io")(server);
  const watcher = require("nukor").createWatcher(filesPath);

  const formatPath = filePath => {
    if (filePath) {
      return slash(path.relative(filesPath, filePath));
    }

    return undefined;
  };

  watcher.on("change", events => {
    io.emit(
      "change",
      events.map(event => ({
        action: event.action,
        kind: event.kind,
        path: formatPath(event.path),
        oldPath: formatPath(event.oldPath),
      })),
    );
  });

  app.use(cors());
  app.use(express.static(basePath));

  app.get("/health", (req, res) => {
    res.json({ date: new Date() });
  });

  app.get("/files.json", async (req, res) => {
    const files = await globby("**/*", {
      cwd: filesPath,
    });

    res.send(files);
  });

  try {
    await watcher.start();

    server.listen(argv.port, argv.host, error => {
      if (error) {
        return signale.fatal(error);
      }

      signale.info(`Server is ready: http://${argv.host}:${argv.port}`);
    });
  } catch (error) {
    signale.fatal(error);
  }
};
