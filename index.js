const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    fs.readdir('./files', (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return res.status(500).send("Server error");
        }

        // Read the contents of each file and store them along with the file name
        let fileContents = [];
        files.forEach((file) => {
            const content = fs.readFileSync(`./files/${file}`, 'utf8');
            fileContents.push({ fileName: file, content: content });
        });

        res.render('index', { files: fileContents });
    });
});

app.post('/create', (req, res) => {
    const { title, details } = req.body;
    const fileName = `./files/${title.split(' ').join('')}.txt`; // Remove spaces from the filename
    fs.writeFile(fileName, details, (err) => {
        if (err) {
            console.error("Error writing file:", err);
            return res.status(500).send("Server error");
        }
        res.redirect('/');
    });
});
app.get('/file/:filename', (req, res) => {
fs.readFile(`./files/${req.params.filename}`,"utf-8",function (err, data) {
    res.render('show',{fileName:req.params.filename,data:data});
})
})
app.get('/edit/:filename', (req, res) => {
    fs.readFile(`./files/${req.params.filename}`, "utf-8", (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).send("Server error");
        }
        res.render('edit', { fileName: req.params.filename, fileContent: { title: req.params.filename, details: data } });
    });
});

app.post('/edit/:filename', (req, res) => {
    const { title, details } = req.body;
    const oldFileName = `./files/${req.params.filename}`;
    const newFileName = `./files/${title.split(' ').join('')}.txt`; // Remove spaces from the filename

    fs.writeFile(newFileName, details, (err) => {
        if (err) {
            console.error("Error writing file:", err);
            return res.status(500).send("Server error");
        }
        if (oldFileName !== newFileName) {
            fs.unlink(oldFileName, (err) => {
                if (err) {
                    console.error("Error deleting old file:", err);
                    return res.status(500).send("Server error");
                }
                res.redirect('/');
            });
        } else {
            res.redirect('/');
        }
    });
});
app.post('/delete/:filename', (req, res) => {
    const fileName = `./files/${req.params.filename}`;
    fs.unlink(fileName, (err) => {
        if (err) {
            console.error("Error deleting file:", err);
            return res.status(500).send("Server error");
        }
        res.redirect('/');
    });
});

app.listen(8000, function () {
    console.log('Server is running on port 8000');
});
