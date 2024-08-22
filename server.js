const express = require('express');
const multer = require('multer');
const OAuth = require('oauth-1.0a');
const request = require('request');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Configuração do armazenamento de arquivos
const upload = multer({ dest: 'uploads/' });

// Configuração OAuth
const oauth = OAuth({
  consumer: { key: 'd4adda3de75ba49b046660ba1cf99cb4', secret: 'a7799525caa75a6a' },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  }
});

// Servir arquivos estáticos
app.use(express.static('.'));

// Rota para o upload
app.post('/upload', upload.single('photo'), (req, res) => {
  const token = {
    key: '72157720926798119-8fdc6e7a4bf57119',
    secret: 'a7a4a1c970734c16'
  };

  const request_data = {
    url: 'https://up.flickr.com/services/upload/',
    method: 'POST',
    data: {
      photo: path.join(__dirname, 'uploads', req.file.filename),
      api_key: 'YOUR_API_KEY',
      format: 'json',
      nojsoncallback: 1
    }
  };

  const headers = oauth.toHeader(oauth.authorize(request_data, token));

  request.post({
    url: request_data.url,
    formData: {
      photo: fs.createReadStream(request_data.data.photo),
      api_key: request_data.data.api_key,
      format: request_data.data.format,
      nojsoncallback: request_data.data.nojsoncallback
    },
    headers: headers
  }, (error, response, body) => {
    if (error) {
      return res.status(500).send('Error uploading photo');
    }
    res.send(body);
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});