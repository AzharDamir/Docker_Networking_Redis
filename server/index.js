const MongoClient = require('mongodb').MongoClient;

const bodyParser = require('body-parser'); 
const express = require('express') // Include ExpressJS

const uri = "mongodb://mongodbcontainerredis:27017/mydb";
//const uri = "mongodb://localhost:27017/mydb";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
const redis = require('redis');


app.use(bodyParser.urlencoded({ extended: false }));


async function Createclientredis(){
  const clientredis=redis.createClient({
    url:"redis://redis:6379",
    socket:{
      connectTimeout:60000,
      keepAlive: 60000,
    }
  });
  clientredis.on('error',err=>console.log('client error',err));
  clientredis.on('connect',()=>console.log('client connected'));
  clientredis.on('ready',()=>console.log('client is ready'));

  await clientredis.connect();
  return clientredis;
}

app.post('/index', async (req, res) => {
  //const data = req.body;
 
  try{
    const clientredis=await Createclientredis()
    const rec = await clientredis.get('data');
    console.log('Form data retrieved from Redis:', rec);
    const data = JSON.parse(rec);
    console.log('data: ', data)
    try {
      await client.connect();
      console.log('Connected to MongoDB server');
    
      const collection = client.db("mydb").collection("mycollection");
      collection.insertOne(data, (err, result) => {
        if (err) throw err;
        console.log("Data inserted!");
      
        client.close();  
      });
    //  await clientredis.del('data');
    //  console.log('Form data deleted from Redis');
      res.send('Data inserted!');
   
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
    
  }catch (err) {
      console.error(err);
      res.send('Error retrieving form data from Redis');
    }
});

const port = 3001
app.listen(port, () => console.log(`This app is listening on port ${port}`));
