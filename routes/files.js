var express = require('express');
var router = express.Router();
var fs = require('fs');
const path = require('path');
var multer = require('multer');

const { exec } = require('child_process');

// const filePath = path.resolve('path');

// exec(`open "${filePath}"`, (error, stdout, stderr) => {  if (error) {
//     console.error(`Error opening file: ${error}`);    return;
//   }  console.log('File opened successfully');
// });

// router.get('/open', function (req, res) {
//     const eee = req.query;
//     // const filePath = path.resolve('public/files/slide-1.pptx');
//     const filePath = path.resolve('public/files/' + eee.file);

//     const command = process.platform === 'win32' ? `start "" "${filePath}"` : `open "${filePath}"`;

//     exec(command, (error, stdout, stderr) => {
//         if (error) {
//             console.error(`Error opening file: ${error}`);
//             res.status(500).send('Error opening file');
//         } else {
//             console.log('File opened successfully');
//             res.send('File opened successfully');
//         }
//     });
// });

// Настройка Multer для обработки загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { path } = req.query; // Get the path from req.body
        if (!path) {
            cb('Path not provided', null); // If path is not provided, throw an error
            return;
        }

        const fullPath = 'public/files' + path; // Full path to the folder
        // Create the folder if it doesn't exist
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }

        cb(null, fullPath); // Specify the path to save files
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // File name
    }
});

var upload = multer({ storage: storage });

router.post('/add/file', upload.single('file'), (req, res) => {
    if (!req.file) {
        res.status(400).send('No file uploaded');
        return;
    }

    res.status(200).send('File uploaded successfully');
});

router.post('/add/folder', (req, res) => {
    const { path, foldername } = req.body;
    const base = 'public/files/';

    if (!foldername) {
        res.status(400).send('Folder name is required');
        return;
    }


    let folderPath;

    if (path) {
        folderPath = base + path + '/' + foldername;
    } else {
        folderPath = base + foldername;
    }

    // Check if folder already exists
    if (fs.existsSync(folderPath)) {
        res.status(400).send('Folder already exists');
        return;
    }

    // Create the folder
    fs.mkdirSync(folderPath);

    res.status(201).send('Folder created successfully');
});

router.delete('/remove/folder', (req, res) => {
    const { path, foldername } = req.body;
    const base = 'public/files/';

    let folderPath;
    //  = `public/files/${foldername}`;

    if (path) {
        // console.log('if');
        folderPath = base + path + '/' + foldername;
    } else {
        folderPath = base + foldername;
        // console.log('else');
    }

    // console.log(folderPath);

    // Check if folder exists
    if (!fs.existsSync(folderPath)) {
        res.status(404).send('Folder not found');
        return;
    }

    // Delete the folder
    fs.rmdirSync(folderPath, { recursive: true });

    res.status(200).send('Folder deleted successfully');
});

router.delete('/remove/file', (req, res) => {
    const { path, filename } = req.body;
    const base = 'public/files/';

    let filePath;

    if (path) {
        filePath = base + path + '/' + filename;
    } else {
        filePath = base + filename;
    }

    if (!fs.existsSync(filePath)) {
        res.status(404).send('File not found');
        return;
    }

    fs.unlinkSync(filePath);

    res.status(200).send('File deleted successfully');
});

// router.get('/open/:filename', function (req, res) {
//     const { filename } = req.params;

//     if (!filename) {
//         res.status(400).send('File parameter is missing');
//         return;
//     }

//     const filePath = path.resolve('public/files/' + filename);

//     // Проверка существования файла
//     fs.access(filePath, fs.constants.F_OK, (err) => {
//         if (err) {
//             console.error(`File not found: ${filename}`);
//             res.status(404).send('File not found');
//             return;
//         }

//         const command = process.platform === 'win32' ? `start "" "${filePath}"` : `open "${filePath}"`;

//         exec(command, (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`Error opening file: ${error}`);
//                 res.status(500).send('Error opening file');
//             } else {
//                 console.log('File opened successfully:', filePath);
//                 res.send('File opened successfully');
//             }
//         });
//     });
// });


// router.get('/open/:folder/:filename', function (req, res) {
//     const { folder, filename } = req.params;

//     if (!folder || !filename) {
//         res.status(400).send('Folder or file parameter is missing');
//         return;
//     }

//     const filePath = path.resolve(`public/files/${folder}/${filename}`);

//     // Check if file exists
//     fs.access(filePath, fs.constants.F_OK, (err) => {
//         if (err) {
//             console.error(`File not found: ${filename}`);
//             res.status(404).send('File not found');
//             return;
//         }

//         const command = process.platform === 'win32' ? `start "" "${filePath}"` : `open "${filePath}"`;

//         exec(command, (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`Error opening file: ${error}`);
//                 res.status(500).send('Error opening file');
//             } else {
//                 console.log('File opened successfully:', filePath);
//                 res.send('File opened successfully');
//             }
//         });
//     });
// });


function isFolder(path) {
    return fs.lstatSync(path).isDirectory() && fs.existsSync(path);
}



// open file
router.post('/open', function (req, res) {
    const { path, filename } = req.body;
    const base = 'public/files/';

    if (!filename) {
        res.status(400).send('File parameter is missing');
        return;
    }


    let filePath;

    if (path) {
        filePath = base + path + '/' + filename;
    } else {
        filePath = base + filename;
    }


    // Проверка существования файла
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`File not found: ${filename}`);
            res.status(404).send('File not found');
            return;
        }

        const command = process.platform === 'win32' ? `start "" "${filePath}"` : `open "${filePath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error opening file: ${error}`);
                res.status(500).send('Error opening file');
            } else {
                console.log('File opened successfully:', filePath);
                res.send('File opened successfully');
            }
        });
    });
});



// Express.js route
router.post('/open/folder', (req, res) => {
    const folderPath = req.body.folderPath; // Получаем путь к папке из тела запроса
    const base = 'public/files';
    const fullPath = 
    'C:/Users/Poghos/Desktop/express-4/' +
    base + folderPath; // Полный путь к папке

    console.log('Full path:', fullPath);
    
    
    require('child_process').exec(`start "" "${fullPath}"`);



    // // Команда для открытия папки в зависимости от операционной системы
    // let openCommand;
    // if (process.platform === 'win32') {
    //     openCommand = `explorer "${fullPath}"`;
    // } else if (process.platform === 'darwin') {
    //     openCommand = `open "${fullPath}"`;
    // } else {
    //     openCommand = `xdg-open "${fullPath}"`;
    // }

    // exec(openCommand, (error, stdout, stderr) => {
    //     if (error) {
    //         console.error(`Error opening folder: ${error.message}`);
    //         res.status(500).send('Error opening folder');
    //         return;
    //     }
    //     if (stderr) {
    //         console.error(`stderr: ${stderr}`);
    //         res.status(500).send('Error opening folder');
    //         return;
    //     }
    //     console.log(`stdout: ${stdout}`);
    //     res.status(200).send('Folder opened successfully');
    // });
});






// router.get('/', function (req, res, next) {

//     const base = 'public/files/';
//     let path = '';

//     if ('path' in req.query) {
//         path = req.query.path;
//     }

//     if (isFolder(base + path)) {
//         // if path === folder

//         let files = fs.readdirSync(base + path)
//             .map(item => {
//                 const isDir = fs.lstatSync(base + path + '/' + item).isDirectory();
//                 let size = 0;

//                 if (!isDir) {
//                     size = fs.statSync(base + path + '/' + item);
//                 }

//                 return {
//                     name: item,
//                     dir: isDir,
//                     size: size.size ?? 0,
//                 }

//             })

//         res.json({
//             path: path,
//             files: files,
//             result: true,
//         });
//     }

// });

function getRandomId() {
    return Math.floor(Math.random() * (9959516516 - 1 + 1)) + 1;
}

router.get('/', function (req, res, next) {
    const base = 'public/files/';
    let path = '';

    if ('path' in req.query) {
        path = req.query.path;
    }

    if (isFolder(base + path)) {
        let files = [];
        let otherItems = [];

        fs.readdirSync(base + path).forEach(item => {
            const isDir = fs.lstatSync(base + path + '/' + item).isDirectory();
            let size = 0;

            if (!isDir) {
                size = fs.statSync(base + path + '/' + item).size;
            }

            const fileInfo = {
                id: getRandomId(),
                name: item,
                dir: isDir,
                size: isDir ? 0 : size, // For directories, set size to 0
            };

            if (isDir) {
                files.push(fileInfo); // Add files to files array
            } else {
                otherItems.push(fileInfo); // Add directories to otherItems array
            }
        });

        const sortedFiles = files.concat(otherItems); // Concatenate files and otherItems arrays

        res.json({
            path: path,
            files: sortedFiles,
            result: true,
            pc_path: "C:/Users/Poghos/Desktop/express-4/public/files",
        });
    }
});



// // Route to handle editing file or folder names
// router.put('/edit', function (req, res, next) {
//     // const base = 'public/files/';
//     // const { path, oldFileName, newName } = req.body; // Assuming you're sending 'path' and 'newName' in the request body
//     // console.log(req.body);

//     const { path, oldFileName, newName } = req.body;
//     const base = 'public/files/';

//     let folderPath;
//     //  = `public/files/${foldername}`;

//     if (path) {
//         // console.log('if');
//         folderPath = base + path + '/' + oldFileName;
//     } else {
//         folderPath = base + oldFileName;
//         // console.log('else');
//     }

//     console.log(folderPath);
//     console.log(base + path + newName);

//     // if (path) {
//         // console.log(path);
//         // console.log(Boolean(path));
//         // console.log(newName);
//         // console.log(base + path + '/' + oldFileName);
//         // console.log(base + path + '/' + newName);
//         // if (path && newName) {
//             try {
//                 fs.renameSync(folderPath, base + path +'/' + newName);
//                 res.json({ success: true, message: 'File or folder name updated successfully.' });
//             } catch (error) {
//                 res.status(500).json({ success: false, message: 'Error updating file or folder name.' });
//             }
//         // } else {
//             // res.status(400).json({ success: false, message: 'Missing path or newName parameters.' });
//         // }
//     // }
//     // else {
//     //     // if (path && newName) {
//     //     console.log(path, 'path');
//     //         console.log('else');
//     //         console.log(base+'/' + oldFileName);
//     //         console.log(base +'/'+ newName);
//     //         try {
//     //             fs.renameSync(base+'/' + oldFileName, base +'/'+ newName);
//     //             res.json({ success: true, message: 'File or folder name updated successfully.' });
//     //         } catch (error) {
//     //             res.status(500).json({ success: false, message: 'Error updating file or folder name.' });
//     //         }
//     //     // } else {
//     //         // res.status(400).json({ success: false, message: 'Missing path or newName parameters.' });
//     //     // }
//     // }
// });






router.put('/edit', function (req, res, next) {
    const { path, oldFileName, newName } = req.body;
    const base = 'public/files/';

    let folderPath;

    if (path) {
        folderPath = base + path + '/' + oldFileName;
    } else {
        folderPath = base + oldFileName;
    }

    try {
        fs.renameSync(folderPath, base + path + '/' + newName);
        res.json({ success: true, message: 'File or folder name updated successfully.' });
    } catch (error) {
        console.error('Error renaming file or folder:', error);
        res.status(500).json({ success: false, message: 'Error updating file or folder name.' });
    }
});




module.exports = router;
