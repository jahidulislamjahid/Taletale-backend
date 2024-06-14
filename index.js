const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qtoag.mongodb.net/Teletale?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to the MongoDB client
    await client.connect();
    console.log('Connected to MongoDB');

    // Access the database and collections
    const db = client.db('Teletale');
    const djiPackages = db.collection('Devices');
    const bookingsCollection = db.collection('bookings');
    const testimonialCollection = db.collection('testimonials');
    const usersCollection = db.collection('users');

    // Routes setup
    app.get('/', (req, res) => {
      res.send('Welcome to Teletale');
    });

    app.get('/Devices', async (req, res) => {
      const result = await djiPackages.find({}).toArray();
      res.send(result);
    });

    app.get('/users', async (req, res) => {
      const result = await usersCollection.find({}).toArray();
      res.send(result);
    });

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.get('/bookings', async (req, res) => {
      let query = {};
      const email = req.query.email;
      if (email) {
        query = { email: email };
      }
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingsCollection.findOne(query);
      res.send(result);
    });

    app.get('/Devices/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await djiPackages.findOne(query);
      res.send(result);
    });

    app.get('/testimonials', async (req, res) => {
      const result = await testimonialCollection.find({}).toArray();
      res.send(result);
    });

    app.post('/Devices', async (req, res) => {
      const newTours = req.body;
      const result = await djiPackages.insertOne(newTours);
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.send(result);
    });

    app.post('/bookings', async (req, res) => {
      const newBooking = req.body;
      const result = await bookingsCollection.insertOne(newBooking);
      res.send(result);
    });

    app.post('/testimonials', async (req, res) => {
      const newBooking = req.body;
      const result = await testimonialCollection.insertOne(newBooking);
      res.send(result);
    });

    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    });

    app.delete('/Devices/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await djiPackages.deleteOne(query);
      res.send(result);
    });

    app.put('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const newStatus = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          data: newStatus.newData,
        },
      };
      const result = await bookingsCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
