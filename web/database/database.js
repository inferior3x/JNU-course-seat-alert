const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let database;

async function connectToDatabase() {
  const client = await MongoClient.connect(
    'mongodb://localhost:27017'
  );
  database = client.db('auto-course-seat-alert');
  database.collection('users').createIndex({ id: 1 }, { unique: true });
  database.collection('courses').createIndex({ code: 1 }, { unique: true });
}

function getDb() {
  if (!database) {
    throw { message: 'You must connect first!' };
  }
  return database;
}

module.exports = {
  connectToDatabase: connectToDatabase,
  getDb: getDb,
};
