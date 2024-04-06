var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs'); // Модуль для работы с файловой системой
var path = require('path');

// Настройка Multer для обработки загрузки файлов
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads') // Путь для сохранения файлов
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Имя файла
  }
})

var upload = multer({ storage: storage })

router.get('/', function(req, res, next) {
    res.render('form');
});  

// Маршрут для загрузки изображений
router.post('/', upload.single('file'), function (req, res, next) {
  // Обработка загруженного файла
  res.send('File uploaded successfully');
});




router.delete('/:filename', function(req, res) {
  const filePath = __dirname + '/../public/uploads/' + req.params.filename; 

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error deleting file');
    } else {
      res.status(200).send('File deleted successfully');
    }
  });
});


module.exports = router;
