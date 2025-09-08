import { MongoMemoryServer } from "mongodb-memory-server";

class MongoDBMemoryServer {
  private static instance: MongoMemoryServer | null = null;
  private static uri: string | null = null;

  static async start(): Promise<string> {
    if (this.instance && this.uri) {
      return this.uri;
    }

    console.log("Starting MongoDB Memory Server...");
    this.instance = await MongoMemoryServer.create({
      instance: {
        dbName: "journal",
        port: 27017,
      },
    });

    this.uri = this.instance.getUri();
    console.log("MongoDB Memory Server started at:", this.uri);
    return this.uri;
  }

  static async stop(): Promise<void> {
    if (this.instance) {
      await this.instance.stop();
      this.instance = null;
      this.uri = null;
      console.log("MongoDB Memory Server stopped");
    }
  }

  static getUri(): string | null {
    return this.uri;
  }
}

export default MongoDBMemoryServer;
