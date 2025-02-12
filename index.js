const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Load environment variables only in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qtoag.mongodb.net/Teletale?retryWrites=true&w=majority`;
let db;

async function connectToDB() {
  if (!db) {
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    db = client.db("Teletale");
  }
  return db;
}

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Teletale");
});

// GET all devices
app.get("/Devices", async (req, res) => {
  try {
    const db = await connectToDB();
    const djiPackages = db.collection("Devices");
    const result = await djiPackages.find({}).toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// GET all users
app.get("/users", async (req, res) => {
  try {
    const db = await connectToDB();
    const usersCollection = db.collection("users");
    const result = await usersCollection.find({}).toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Verify admin status
app.get("/users/:email", async (req, res) => {
  try {
    const db = await connectToDB();
    const usersCollection = db.collection("users");
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    const isAdmin = user?.role === "admin";
    res.json({ admin: isAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// GET all bookings (with optional email filter)
app.get("/bookings", async (req, res) => {
  try {
    const db = await connectToDB();
    const bookingsCollection = db.collection("bookings");
    const email = req.query.email;
    const query = email ? { email: email } : {};
    const result = await bookingsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// GET a specific booking by ID
app.get("/bookings/:id", async (req, res) => {
  try {
    const db = await connectToDB();
    const bookingsCollection = db.collection("bookings");
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await bookingsCollection.findOne(query);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// GET a specific device by ID
app.get("/Devices/:id", async (req, res) => {
  try {
    const db = await connectToDB();
    const djiPackages = db.collection("Devices");
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await djiPackages.findOne(query);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// GET all testimonials
app.get("/testimonials", async (req, res) => {
  try {
    const db = await connectToDB();
    const testimonialCollection = db.collection("testimonials");
    const result = await testimonialCollection.find({}).toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// POST a new device
app.post("/Devices", async (req, res) => {
  try {
    const db = await connectToDB();
    const djiPackages = db.collection("Devices");
    const newTours = req.body;
    const result = await djiPackages.insertOne(newTours);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// POST a new user
app.post("/users", async (req, res) => {
  try {
    const db = await connectToDB();
    const usersCollection = db.collection("users");
    const user = req.body;
    const result = await usersCollection.insertOne(user);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// POST a new booking
app.post("/bookings", async (req, res) => {
  try {
    const db = await connectToDB();
    const bookingsCollection = db.collection("bookings");
    const newBooking = req.body;
    const result = await bookingsCollection.insertOne(newBooking);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// POST a new testimonial
app.post("/testimonials", async (req, res) => {
  try {
    const db = await connectToDB();
    const testimonialCollection = db.collection("testimonials");
    const newTestimonial = req.body;
    const result = await testimonialCollection.insertOne(newTestimonial);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// DELETE a booking by ID
app.delete("/bookings/:id", async (req, res) => {
  try {
    const db = await connectToDB();
    const bookingsCollection = db.collection("bookings");
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await bookingsCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// DELETE a device by ID
app.delete("/Devices/:id", async (req, res) => {
  try {
    const db = await connectToDB();
    const djiPackages = db.collection("Devices");
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await djiPackages.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// UPDATE a booking by ID
app.put("/bookings/:id", async (req, res) => {
  try {
    const db = await connectToDB();
    const bookingsCollection = db.collection("bookings");
    const id = req.params.id;
    const newStatus = req.body;
    const query = { _id: ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = { $set: { data: newStatus.newData } };
    const result = await bookingsCollection.updateOne(query, updateDoc, options);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Upsert a user (Google login)
app.put("/users", async (req, res) => {
  try {
    const db = await connectToDB();
    const usersCollection = db.collection("users");
    const user = req.body;
    const filter = { email: user.email };
    const options = { upsert: true };
    const updateDoc = { $set: user };
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Add admin role to a user
app.put("/users/admin", async (req, res) => {
  try {
    const db = await connectToDB();
    const usersCollection = db.collection("users");
    const user = req.body;
    const filter = { email: user.email };
    const updateDoc = { $set: { role: "admin" } };
    const result = await usersCollection.updateOne(filter, updateDoc);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
