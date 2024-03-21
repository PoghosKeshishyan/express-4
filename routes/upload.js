var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs'); // Модуль для работы с файловой системой
var path = require('path');

// Настройка Multer для обработки загрузки файлов
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Путь для сохранения файлов
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Имя файла
  }
})

var upload = multer({ storage: storage })

router.get('/', function(req, res, next) {
    res.render('form');
});  

// Маршрут для получения одного изображения по его имени
router.get('/:name', function(req, res, next) {
    var fileName = req.params.name; // Получаем имя файла из параметра маршрута
    var filePath = 'uploads/' + fileName; // Путь к файлу
  
    // Определение Content-Type на основе расширения файла
    var contentType = getContentType(fileName);

    // Чтение файла
    fs.readFile(filePath, function(err, data) {
      if (err) {
        // Если произошла ошибка при чтении файла, отправляем статус 404 (Not Found)
        res.status(404).send('File not found');
      } else {
        // Если файл успешно прочитан, отправляем его клиенту как ответ
        res.writeHead(200, {'Content-Type': contentType});
        res.end(data);
      }
    });
});

// Функция для определения Content-Type на основе расширения файла
function getContentType(fileName) {
    var ext = path.extname(fileName).toLowerCase();
    switch (ext) {
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.js':
            return 'application/javascript';
        case '.json':
            return 'application/json';
        case '.pdf':
            return 'application/pdf';
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.doc':
            return 'application/msword'; // Word документы
        case '.docx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; // Word документы
        case '.xls':
            return 'application/vnd.ms-excel'; // Excel документы
        case '.xlsx':
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // Excel документы
        case '.ppt':
            return 'application/vnd.ms-powerpoint'; // PowerPoint документы
        case '.pptx':
            return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'; // PowerPoint документы
        case '.mp4':
            return 'video/mp4'; // Видео файлы
        case '.avi':
            return 'video/x-msvideo'; // Видео файлы
        // Добавьте другие расширения файлов и их Content-Type по необходимости
        default:
            return 'application/octet-stream'; // Неизвестный или двоичный тип данных
    }
}

// Маршрут для загрузки изображений
router.post('/', upload.single('image'), function (req, res, next) {
  // Обработка загруженного файла
  res.send('File uploaded successfully');
});

module.exports = router;
