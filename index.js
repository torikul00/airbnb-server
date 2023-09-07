const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const uri = `mongodb+srv://airbnbtorikul:${process.env.DB_PASS}@airbnb.m1uf4ng.mongodb.net/?retryWrites=true&w=majority`

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
})

async function run() {
    try {
        // const usersCollection = client.db('aircncDb').collection('users')
        // const roomsCollection = client.db('aircncDb').collection('rooms')
        // const bookingsCollection = client.db('aircncDb').collection('bookings')

        // Send a ping to confirm a successful connection
        console.log('mongoDB connected')
        await client.db('admin').command({ ping: 1 })
        console.log(
            'Pinged your deployment. You successfully connected to MongoDB!'
        )
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('airbnb Server is running..')
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})