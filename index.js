const express = require('express')
const app = express()
var cors = require('cors')
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//Mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb://localhost:27017";
//const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.caivj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
 
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("car-doctor");
    const serviceCollection = database.collection("services");
    const bookingCollection = database.collection("bookings");
    
    //Services Collection
    //Get 
    app.get('/services',async(req,res)=>{
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    //Get for Individual data
    app.get('/services/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    })


    //Bookings Collection

    //Get Query
    app.get('/bookings',async(req,res)=>{
      let query ={};
      if(req.query?.email)
      {
        query = {email:req.query.email};
      }
      const cursor = bookingCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    //post 
    app.post('/bookings',async(req,res)=>{
      const currentBooking = req.body;
      const result = await bookingCollection.insertOne(currentBooking);
      res.send(result);
    })

    //put
    app.put('/bookings/:id',async(req,res)=>{
      const id = req.params.id;
      const currentBooking = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: currentBooking.status
        },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })
    
    //Delete
    app.delete('/bookings/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await  bookingCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Recap car-doctor is starting..')
})

app.listen(port, () => {
  console.log(`The port is: ${port}`)
})