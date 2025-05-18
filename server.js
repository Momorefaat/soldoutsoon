const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('../soldoutsoon-frontend'));

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/soldoutsoon';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

async function startServer() {
  try {
    await client.connect();
    db = client.db('soldoutsoon');
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

startServer();

// User Registration (plain text password)
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone, address } = req.body;
    const user = {
      username,
      email,
      password,  // Stored directly as plain text
      firstName,
      lastName,
      phone,
      address,
      orderHistory: [],
      createdAt: new Date(),
      role: 'user'
    };
    const result = await db.collection('users').insertOne(user);
    res.status(201).json({ _id: result.insertedId, ...user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User Login (plain text password comparison)
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username, 'with password:', password);
    const user = await db.collection('users').findOne({ username });
    if (!user) {
      console.log('User not found for username:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.password !== password) {
      console.log('Password mismatch. Expected:', user.password, 'Received:', password);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log('Login successful for user:', username);
    res.json({ _id: user._id, username: user.username, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Events
app.get('/api/events', async (req, res) => {
  try {
    const events = await db.collection('events').find().toArray();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await db.collection('events').findOne({ _id: new ObjectId(req.params.id) });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Order
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items, totalAmount, paymentMethod, billingAddress } = req.body;
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const order = {
      userId: new ObjectId(userId),
      userName: user.username,
      items,
      totalAmount,
      paymentMethod,
      billingAddress,
      status: 'pending',
      createdAt: new Date()
    };
    const result = await db.collection('orders').insertOne(order);

    // Update user's orderHistory
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $push: { orderHistory: { orderId: result.insertedId, eventId: items[0].eventId, totalAmount } } }
    );
    res.status(201).json({ _id: result.insertedId, ...order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Orders by User ID
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const orders = await db.collection('orders').find({ userId: new ObjectId(req.params.userId) }).toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to check user role
async function checkRole(req, res, next) {
  const { userId } = req.body;
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user || (user.role !== 'admin' && user.role !== 'organizer')) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

// Create Artist
app.post('/api/artists', checkRole, async (req, res) => {
  try {
    const { name, bio, genres, imageUrl } = req.body;
    const artist = {
      name,
      bio,
      genres,
      imageUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('artists').insertOne(artist);
    res.status(201).json({ _id: result.insertedId, ...artist });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Event
app.post('/api/events', checkRole, async (req, res) => {
  try {
    const { eventName, eventDate, eventTime, description, venue, artists, genres, ticketTypes, images, ageRestriction } = req.body;
    const event = {
      eventName,
      eventDate: new Date(eventDate),
      eventTime,
      description,
      venue,
      artists,
      genres,
      ticketTypes,
      images,
      ageRestriction,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: new ObjectId(req.body.userId),
      isActive: true
    };
    const result = await db.collection('events').insertOne(event);
    res.status(201).json({ _id: result.insertedId, ...event });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Refund Order
app.post('/api/orders/:orderId/refund', async (req, res) => {
  const session = client.startSession();
  try {
    session.startTransaction();
    const orderId = req.params.orderId;
    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) }, { session });
    if (!order || order.status !== 'completed') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Order cannot be refunded' });
    }

    await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status: 'refunded', updatedAt: new Date() } },
      { session }
    );

    for (const item of order.items) {
      await db.collection('events').updateOne(
        { _id: new ObjectId(item.eventId), 'ticketTypes.name': item.ticketType },
        { $inc: { 'ticketTypes.$.available': item.quantity } },
        { session }
      );
    }

    await db.collection('users').updateOne(
      { _id: order.userId, 'orderHistory.orderId': new ObjectId(orderId) },
      { $set: { 'orderHistory.$.status': 'refunded' } },
      { session }
    );

    await session.commitTransaction();
    res.json({ message: 'Order refunded successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
});
