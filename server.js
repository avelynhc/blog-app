/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Hyunjeong Choi Student ID: 143281202 Date: Feb 13th. 2022
*
*  Online (Heroku) URL: 
*
*  GitHub Repository URL: https://github.com/avelynhc/web322-app
*
********************************************************************************/ 
var express = require("express");
var app = express();
const env = require("dotenv");
env.config();
var blogService = require("./blog-service.js");
var path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true
});

const HTTP_PORT = process.env.PORT || 8080;
const onHttpStart = () => console.log(`Express http server listening on port ${HTTP_PORT}`);

app.use(express.static('public')); 
const upload = multer(); 

app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
})

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;    
    }
    
    upload(req).then((uploaded) => {
        req.body.featureImage = uploaded.url;
        blogService.addPost(req.body)
        .then((data) => res.redirect("/posts"))
        .catch((error) => res.status(500).send(error));
    }).catch((error) => res.status(500).send(error));
})

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/blog", (req, res) => {
    blogService.getPublishedPosts().then((data) => {
        res.json(data);
    }).catch((err) => res.json({"message": err}))
})

app.get("/posts", (req, res) => {
    if (req.query.category) {
        blogService.getPostsByCategory(req.query.category).then((data) => {
            res.json(data);
        }).catch((err) => res.json({"message": err}))
    } else if (req.query.minDate) {
        blogService.getPostsByMinDate(req.query.minDate).then((data) => {
            res.json(data);
        }).catch((err) => res.json({"message": err}))
    } else {
        blogService.getAllPosts().then((data) => {
            res.json(data);
        }).catch((err) => res.json({"message": err}))
    }
})

app.get("/post/:value", (req, res) => {
    blogService.getPostByID(req.params.value).then((data) => {
        res.json(data);
    }).catch((err) => res.json({"message": err}))
})

app.get("/categories", (req, res) => {
    blogService.getCategories().then((data) => {
        res.json(data);
    }).catch((err) => res.json({"message": err}))
})

app.use((req, res) => {
    res.status(404).send("Page Not Found");
})

blogService.initialize().then(() => {
    console.log("start the server");
    app.listen(HTTP_PORT, onHttpStart);
}).catch(() => console.log("unable to start the server"))
