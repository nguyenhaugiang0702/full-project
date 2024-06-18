const { MongoClient } = require("mongodb");

class MongoDB {
    static client = null;

    static async connect(uri) {
      try {
        if (!this.client) {
          this.client = new MongoClient(uri);
          await this.client.connect();
          console.log("Connected to MongoDB");
        }
        return this.client;
      } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
      }
    }
}

module.exports = MongoDB;
