const express = require('express') // Include ExpressJS
const bodyParser = require('body-parser'); 
const app = express()

const request = require('request');

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/formulaire.html');
}); 
const redis = require('redis');

async function client(){
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
app.post('/index', async(req, res) => {
 
  let formData=req.body;
  const clientredis=await client();
  clientredis.set("data", JSON.stringify(formData))

  console.log(formData);
  //http://servercontainerredis:3001/index'
  request.post('http://servercontainerredis:3001/index', { form: formData }, (err, response, body) => {
    if (err) {
      console.error(err);
      res.send('Error submitting form');
    } else {
      console.log("ok")
      console.log(body)
      res.send('data inserted');
    }
});
});

const port = 3000 
app.listen(port, () => console.log(`This app is listening on port ${port}`));