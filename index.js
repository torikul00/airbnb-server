const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
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
const uri = `mongodb+srv://airbnb:DnZucSOqeshJluog@cluster0.hrgeg.mongodb.net/?retryWrites=true&w=majority`

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        client.connect();
        const roomsCollection = client.db('roomDB').collection('rooms')

        app.get('/allRooms', async (req, res) => {
            const allRooms = await roomsCollection.find().toArray()
            res.send(allRooms)
        })

        app.get('/allRooms/filters', async (req, res) => {

            const propertyType = req.query.propertyType.split(',')
            const roomType = req.query.roomType;
            const beds = parseInt(req.query.beds)
            const minPrice = parseFloat(req.query.minPrice)
            const maxPrice = parseFloat(req.query.maxPrice)
            const bathrooms = parseInt(req.query.bathrooms)
            const bedrooms = parseInt(req.query.bedrooms)

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
            res.send(filteredRooms)

        })


        app.get('/allRooms/search', async (req, res) => {

            const destination = req.query.destination;
            const dateRange = req.query.dateRange;
            const checkIn = dateRange.split(' - ')[0];
            const checkOut = dateRange.split(' - ')[1];
            const guests = req.query.guests;
            const pets = req.query.pets;
            const infants = req.query.infants;

            let searchedRooms;
            const query = {};
            searchedRooms = await roomsCollection.find({}).toArray()

            // Add conditions to the query only if the values are not "0"
            if (guests !== '0') {
                query['holdingCapacity.guests'] = guests;
            }
            if (pets !== '0') {
                query['holdingCapacity.pets'] = pets;
            }
            if (infants !== '0') {
                query['holdingCapacity.infants'] = infants;
            }



            if (destination) {
                searchedRooms = await roomsCollection.find({ location: { $regex: destination, $options: "i" } }).toArray();
            }
            if (Object.entries(query).length > 0) {
                searchedRooms = await roomsCollection.find(query).toArray();
            }

            if (checkIn !== checkOut) {
                searchedRooms = await roomsCollection.find({ dateRange: dateRange }).toArray();
            }

            res.send(searchedRooms)


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
    res.send('Server is running..')
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})