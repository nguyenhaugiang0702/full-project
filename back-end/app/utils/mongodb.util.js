const { MongoClient } = require("mongodb");

class MongoDB {
  static connect = async (uri) => {
    // if(this.client) return this.client;
    // this.client = await MongoClient.connect(uri);
    // return this.client;
    if (db) return db;
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    db = client.db();
    console.log("Connected to MongoDB");
    return db;
  };
}

module.exports = MongoDB;
