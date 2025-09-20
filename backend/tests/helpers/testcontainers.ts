/**
 * Testcontainers setup for MongoDB integration tests
 *
 * Provides lightweight Docker-based MongoDB instance for testing
 * as a replacement for MongoDB Memory Server (which uses 2GB+ RAM)
 */

import { GenericContainer, StartedTestContainer } from 'testcontainers';
import mongoose from 'mongoose';

export interface MongoTestContainer {
  container: StartedTestContainer;
  uri: string;
}

/**
 * Create and start a MongoDB test container
 * Returns container instance and connection URI
 */
export async function createMongoTestContainer(): Promise<MongoTestContainer> {
  console.log('Starting MongoDB test container...');

  const container = await new GenericContainer('mongo:8.0')
    .withExposedPorts(27017)
    .withEnvironment({
      MONGO_INITDB_ROOT_USERNAME: 'testuser',
      MONGO_INITDB_ROOT_PASSWORD: 'testpass',
      MONGO_INITDB_DATABASE: 'testdb'
    })
    .withStartupTimeout(60000) // 60 seconds timeout
    .start();

  const port = container.getMappedPort(27017);
  const uri = `mongodb://testuser:testpass@localhost:${port}/testdb?authSource=admin`;

  console.log(`MongoDB container started on port ${port}`);

  return {
    container,
    uri
  };
}

/**
 * Connect Mongoose to the test container
 */
export async function connectToTestContainer(uri: string): Promise<void> {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB test container');
}

/**
 * Clean up: disconnect and stop container
 */
export async function cleanupTestContainer(
  container: StartedTestContainer
): Promise<void> {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await container.stop();
    console.log('MongoDB test container cleaned up');
  } catch (error) {
    console.error('Error during container cleanup:', error);
    throw error;
  }
}