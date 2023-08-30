const mongodbStore = require("connect-mongodb-session");

function createMongodbSessionStore(session) {
    const MongoDBStore = mongodbStore(session);
    const sessionStore = new MongoDBStore({
      uri: "mongodb://localhost:27017",
      databaseName: "auto-course-seat-alert",
      collection: "sessions",
    });
    return sessionStore
  }
function createMongodbSession(mongodbSessionStore){
  return {
    secret: 'super-secret',
    resave: false,
    saveUninitialized: false,
    store: mongodbSessionStore,
    cookie: {
      maxAge: 2 * 24 * 60 * 60 * 1000
    },
  }
}

module.exports = {createMongodbSessionStore : createMongodbSessionStore, createMongodbSession: createMongodbSession}