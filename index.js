const path = require('path');
const express = require('express');
const dotenv = require('dotenv').config();
const port = process.env.PORT || 5000;
const cors = require('cors');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');

// Enable CORS
app.use(cors());
// Enable body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/openai', require('./routes/openaiRoutes'));


app.post("/img/download",(req,res)=>{
    const {link} = req.body;
    axios({
        method: 'get',
        url: link,
        responseType: 'arraybuffer'
      })
      .then(function (response) {
        res.set('Content-Type', 'image/jpeg');
        res.send(new Buffer(response.data));
      })
      .catch(function (error) {
        res.status(500).send('Error getting image data from API');
      });
})

app.post("/yt",(req,res)=>{
    try{
        axios.get(req.body.link).then((response)=>{
            const $ = cheerio.load(response.data);
            // Get the video title
            const title = $('meta[property="og:title"]').attr('content');

            // Get the video description
            const description = $('meta[property="og:description"]').attr('content');
            return res.json({title,description});
        })
    }
    catch(err){
        console.log(err);
        res.send(err);
    }
    

})

app.listen(port, () => console.log(`Server started on port ${port}`));
