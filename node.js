const http = require('http'),
  app = require('express')(),
  fs = require('fs')
  bodyParser = require('body-parser')
  request = require('request'),
  sharp = require('sharp'),
  multer = require('multer'),
  server = http.Server(app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.get('/',function(req, res){
  res.render('form');
});

const upload = multer({
  dest: '/',
  fileFilter: function (req, file, cb) {
      var allowType = ['image/jpeg', 'image/png'];
      cb(null, allowType.indexOf(file.mimetype) != -1);
  }
});

app.post('/', upload.single('avatar'), function(req, res){
  let transform = sharp();
  transform = transform.resize(null, 200).embed();
  const date = Date.now();
  if(req.body.imageurl) {
    const url = req.body.imageurl;
    if(url.match(/\.(jpeg|jpg|gif|png)$/) == null && url.match(/\.(jpeg|jpg|gif|png)\?/) == null) {
      res.render('form', { message : 'Url does not contain the image' });
      return;
    }
    
    request.get(url)
    .on('error', function(err) {
      console.log(err)
    })
    .pipe(transform)
    .pipe(fs.createWriteStream(`imageurl_${date}.jpg`));

    res.render('form', { message : 'success' });
  }
   
  if(typeof req.file != 'undefined' && req.file.path) {
    const readStream = fs.createReadStream(req.file.path);
    var extension = req.file.originalname.split(".");
    readStream.pipe(transform).pipe(fs.createWriteStream(`imagefile_${date}.${extension[extension.length - 1]}`))
    res.render('form', { message : 'success' });
  }
});

const hostname = '127.0.0.1';
const port = 3003;

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
