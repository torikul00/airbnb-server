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
            const bathrooms = parseInt(req.query.bathrooms)




            // http://localhost:5000/allRooms/filters?beds=2&bedrooms=2&bathrooms=1&propertyType=Apartment&minPrice=233&maxPrice=400

            const rooms = await roomsCollection.find({}).toArray()

            let filteredRooms;


            if (roomType === "All type") {
                const averagePrice = await roomsCollection.aggregate([
                    {
                        $group: {
                            _id: null,
                            averagePrice: { $avg: '$price' }
                        }
                    }
                ]).toArray()
                console.log(averagePrice)
                filteredRooms = rooms?.filter(room => room.price <= averagePrice[0].averagePrice)
            }
            else {
                const averagePrice = await roomsCollection.aggregate([
                    {
                        $match: {
                            $or: [
                                { category: roomType },
                                { propertyType: roomType }
                            ]
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            averagePrice: { $avg: '$price' }
                        }
                    }
                ]).toArray()
                console.log(averagePrice)
                filteredRooms = rooms?.filter(room => room.price <= averagePrice[0].averagePrice)
            }
            // console.log(filteredRooms)

            filteredRooms = filteredRooms.filter(room => room.price >= minPrice && room.price <= maxPrice)


            if (beds) {
                filteredRooms = filteredRooms?.filter(room => room.beds === beds);

            }

            if (bedrooms) {
                filteredRooms = filteredRooms?.filter(room => room.bedrooms === bedrooms);

            }

            if (bathrooms) {
                filteredRooms = filteredRooms?.filter(room => room.bathroom === bathrooms);

            }

            if (!propertyType.includes('')) {
                filteredRooms = filteredRooms?.filter(room => propertyType.includes(room.propertyType))

            }

            //  console.log(beds,bedrooms,bathrooms)
            res.send(filteredRooms)


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