// backend/db.js
const oracledb = require("oracledb");
const { Client } = require("ssh2");
const fs = require("fs");
const net = require("net");

let tunnelReady = false;


// const { connectToDb, runQuery } = require("./backend/db");




// ✅ Enable Thick mode (using environment variable)
oracledb.initOracleClient({
  libDir: process.env.ORACLE_CLIENT_LIB_DIR || '/Applications/instantclient_23_3'
});

require("dotenv").config();

const {
  SSH_BASTION_HOST,
  SSH_BASTION_USER,
  SSH_PRIVATE_KEY,
  SSH_TARGET_HOST,
  SSH_TARGET_USER,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_SERVICE_NAME,
  LOCAL_PORT
} = process.env;

async function createSshTunnel() {
  return new Promise((resolve, reject) => {
    const bastion = new Client();
    const target = new Client();

    bastion
      .on("ready", () => {
        console.log("Bastion connected");

        bastion.forwardOut("127.0.0.1", 0, SSH_TARGET_HOST, 22, (err, stream) => {
          if (err) return reject(err);

          target
            .on("ready", () => {
              console.log("Target connected");

              // 1️⃣ Create a local server that forwards traffic through both SSH layers
              const server = net.createServer((localSocket) => {
                target.forwardOut(
                  localSocket.localAddress,
                  localSocket.localPort,
                  DB_HOST,
                  Number(DB_PORT),
                  (err, dbStream) => {
                    if (err) {
                      console.error("Forwarding error:", err);
                      localSocket.destroy();
                      return;
                    }
                    localSocket.pipe(dbStream);
                    dbStream.pipe(localSocket);
                  }
                );
              });

              server.listen(LOCAL_PORT, "127.0.0.1", () => {
                console.log(
                  `Local tunnel listening on 127.0.0.1:${LOCAL_PORT} → ${DB_HOST}:${DB_PORT}`
                );
                resolve();
              });
            })
            .connect({
              sock: stream,
              username: SSH_TARGET_USER,
              privateKey: fs.readFileSync(SSH_PRIVATE_KEY),
            });
        });
      })
      .connect({
        host: SSH_BASTION_HOST,
        username: SSH_BASTION_USER,
        privateKey: fs.readFileSync(SSH_PRIVATE_KEY),
      });
  });
}

async function connectToDb() {
  // await createSshTunnel();

  if (!tunnelReady) {
    await createSshTunnel();
    tunnelReady = true;
  }

  const connectString = `(DESCRIPTION=
  (ADDRESS=(PROTOCOL=TCP)(HOST=127.0.0.1)(PORT=${LOCAL_PORT}))
  (CONNECT_DATA=(SERVICE_NAME=${DB_SERVICE_NAME}))
)`;


  console.log(`🟡 Connecting to Oracle via SSH tunnel localhost:${LOCAL_PORT}/${DB_SERVICE_NAME}`);

  const connection = await oracledb.getConnection({
    user: DB_USER,
    password: DB_PASSWORD,
    connectString,
  });

  console.log("Oracle connection established");
  return connection;
}

async function runQuery(sql, binds = []) {
  const connection = await connectToDb();
  try {
    const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return result.rows;
  } finally {
    await connection.close();
  }
}

module.exports = { connectToDb, runQuery };






