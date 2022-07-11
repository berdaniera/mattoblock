const express = require('express')
const db = require('better-sqlite3')('token.db');
const app = express()
const port = 3000
const baseurl = 'https://someurl.com';
app.use(express.static('public'));

function makeHtml(path){
    return `
    <html>
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
    <meta charset="utf-8"/>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js"></script>
    <script src="${path}"></script>
    <style type="text/css">
    html {
      height: 100%;
    }
    body {
      min-height: 100%;
      margin: 0;
      padding: 0;
    }
    canvas {
      padding: 0;
      margin: auto;
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }
    </style>
    </head>
    </html>
    `
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/metadata/:tokenId', (req, res) => {
    let tokenId = req.params.tokenId;
    const token = db.prepare(`SELECT * FROM metadata WHERE id = ?`).get(tokenId);
    if (! token){
        metadata = {"Error":"Token metadata is missing."}
    }else{
        metadata = {
            "name": token.name,
            "description": token.description,
            "image": `${baseurl}/image/${tokenId}.png`,
            "animation_url": `${baseurl}/asset/${tokenId}`,
            // "attributes": [ ... ],
        }
    }
    res.json(metadata);
})

app.get('/asset/:tokenId', (req, res) => {
    let tokenId = req.params.tokenId;
    // get the path for the js file from the token?
    // alternatively, read some other stuff from the database and put it into the script URL
    let html = makeHtml(`/js/${tokenId}.js`);
    res.send(html);
})

app.get('/render/:scriptName', (req, res) => {
    // this renders directly from the script name, for creating the token metadata...
    let html = makeHtml(`/render_scripts/${req.params.scriptName}`);
    res.send(html);
})

app.listen(port, () => {
  console.log(`API listening on port ${port}`)
})
