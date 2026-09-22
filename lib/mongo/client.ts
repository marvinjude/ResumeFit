import "server-only";
import { MongoClient, type Db } from "mongodb";

const DB_NAME = "resumefit";

declare global {
  var _resumefitMongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured on the server");
  }
  return new MongoClient(uri).connect();
}

let prodClientPromise: Promise<MongoClient> | undefined;

/**
 * Connection-caching singleton. In development, the promise is stashed on
 * `globalThis` so Next.js's module-reloading on every hot reload doesn't
 * open a fresh connection each time. In production the module-level
 * variable already persists for the life of the server process.
 */
export function getMongoClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!global._resumefitMongoClientPromise) {
      global._resumefitMongoClientPromise = createClientPromise();
    }
    return global._resumefitMongoClientPromise;
  }
  if (!prodClientPromise) {
    prodClientPromise = createClientPromise();
  }
  return prodClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClientPromise();
  return client.db(DB_NAME);
}
