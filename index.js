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

        const roomsCollection = client.db('roomDB').collection('rooms')
        // const bookingsCollection = client.db('aircncDb').collection('bookings')
        app.get('/allRooms', async (req, res) => {

            const allRooms = await roomsCollection.find({}).toArray()
            res.send(allRooms)

        })

        app.get('/allRooms/filters', async (req, res) => {

            const roomType = req.query.roomType;
            const propertyType = req.query.propertyType.split(',')
            const minPrice = parseFloat(req.query.minPrice)
            const maxPrice = parseFloat(req.query.maxPrice)
            const beds = parseInt(req.query.beds)
            const bedrooms = parseInt(req.query.bedrooms)
            const bathroom = parseInt(req.query.bathroom)
            res.send({
                roomType: roomType
            })


        })












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
    res.send('Airbnb Server is running..')
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})