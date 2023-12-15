const { MongoClient, ObjectId } = require("mongodb");
let mongoDB = null;
(async function () {
  const urlMongoDB = process.env.MONGODB_URL;
  const client = new MongoClient(urlMongoDB);
  try {
    await client.connect();
    console.log("mongodb에 정상적으로 연결됨");
    mongoDB = client.db("sau");
  } catch (err) {
    console.log(err);
  }
})();

const find = async (collectionName, condition = {}) => {
  const r = await mongoDB.collection(collectionName).find(condition).toArray();
  return r;
};

const findById = async (collectionName, _id) => {
  const r = await mongoDB
    .collection(collectionName)
    .findOne({ _id: new ObjectId(_id) });

  return r;
};

const insertOne = async (collectionName, data) => {
  const r = await mongoDB.collection(collectionName).insertOne(data);
  return r;
};

const insertMany = async (collectionName, data) => {
  const r = await mongoDB.collection(collectionName).insertMany(data);
  return r;
};

const updateById = async (collectionName, data, _id) => {
  const r = await mongoDB
    .collection(collectionName)
    .updateOne(
      { _id: new ObjectId(_id) },
      { $set: data, $currentDate: { lastModified: true } }
    );

  return r;
};

const deleteById = async (collectionName, _id) => {
  const r = await mongoDB
    .collection(collectionName)
    .deleteOne({ _id: new ObjectId(_id) });

  return r;
};

module.exports = {
  find,
  findById,
  insertOne,
  insertMany,
  updateById,
  deleteById,
};
