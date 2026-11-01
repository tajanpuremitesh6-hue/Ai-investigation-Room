import mongoose from 'mongoose';

let connectionPromise;

export async function connectDatabase(uri) {
  if (!uri) {
    console.info('MONGODB_URI is not set; starting without a database connection.');
    return false;
  }
  if (mongoose.connection.readyState === 1) return true;
  connectionPromise ??= mongoose.connect(uri)
    .then(() => {
      console.info('Connected to MongoDB.');
      return true;
    })
    .finally(() => { connectionPromise = undefined; });
  return connectionPromise;
}
