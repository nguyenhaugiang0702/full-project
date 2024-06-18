const { MongoClient } = require("mongodb");

class MongoDB {
  static client;

  static connect = async (uri) => {
    if (this.client) return this.client;
    this.client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await this.client.connect();
    return this.client;
  };
}

module.exports = MongoDB;
