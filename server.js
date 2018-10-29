const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const utils = require('./utils');
const env = require('./env');

console.log( );

const app = express();
const PORT = env.port;

app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());


app.get('/', (req, res) => {
  console.log(req);
  res.send('Hello World');
});

app.post('/getStudentInformation', async (req, res) => {
  console.log(req.body);
  try {
    const studentInformation = await utils.getStudentInformation(req.body.id, req.body.password);
    res.json(studentInformation);
  }
  catch (err) {
    res.send('Somthing Wrong Happened');
  } 
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}`));


// how to make the request
// const something = await axios.post('http://localhost:3003/getStudentInformation', {id: '112233'});
// console.log(something);
