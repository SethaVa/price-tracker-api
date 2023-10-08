const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

async function connectToDB() {
  const mongod = await MongoMemoryServer.create();
  const getUri = mongod.getUri();

  mongoose.set("strictQuery", true);
  const db = await mongoose.connect(process.env.MONGODB_URI || getUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return db;
}

module.exports = connectToDB;
