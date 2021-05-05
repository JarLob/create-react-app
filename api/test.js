// Import Dependencies
const url = require('url')
const MongoClient = require('mongodb').MongoClient

// Create cached connection variable
let cachedDb = null

// A function for connecting to MongoDB,
// taking a single parameter of the connection string
async function connectToDatabase(uri) {
  // If the database connection is cached,
  // use it instead of creating a new connection
  if (cachedDb) {
    return cachedDb
  }

  // If no connection is cached, create a new one
  const client = await MongoClient.connect(uri, { useNewUrlParser: true })

  // Select the database through the connection,
  // using the database path of the connection string
  const db = await client.db(url.parse(uri).pathname.substr(1))

  // Cache the database connection and return the connection
  cachedDb = db
  return db
}

// The main, exported, function of the endpoint,
// dealing with the request and subsequent response
module.exports = async (req, res) => {
  // Get a database connection, cached or otherwise,
  // using the connection string environment variable as the argument
  const db = await connectToDatabase(process.env.MONGODB_URI)

  const { method } = req;

  switch (method) {
    case "GET":
      let getResponse = await db.collection("sample_training.companies").find({}).toArray();
      res.status(200).json(getResponse);
      break;
    case "POST":
      const { name, description, type } = req.body;
      const { filename } = req.file;

      let postResponse = await db
        .collection("clothing")
        .insert({ name, description, filename, type });
      res.status(200).json(postResponse);
      break;
    case "DELETE":
      const { _id } = req.body;

      let deleteResponse = await db
        .collection("clothing")
        .deleteOne({ _id: ObjectId(_id) });
      res.status(200).json(deleteResponse);
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}