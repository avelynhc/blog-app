var express = require("express");
var app = express();
var blogService = require("./blog-service.js");
var path = require("path");

const HTTP_PORT = process.env.PORT || 8080;

function onHttpStart(){
    console.log("Express http server listening on port " + HTTP_PORT);
}

app.use(express.static('public')); 

app.get("/", function(req,res){
    res.sendFile(path.join(__dirname, "/views/about.html"))
});

app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/blog", function(req, res){
    blogService.getPublishedPosts().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json({"message": err});
    })
})

app.get("/posts", function(req, res){
    blogService.getAllPosts().then((data) => {
        res.json(data);
    }).catch((err)=> {
        res.json({"message": err});
    })
})

app.get("/categories", function(req, res){
    blogService.getCategories().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json({"message": err});
    })
})

app.use(function(req, res){
    res.status(404).send("Page Not Found");
})

blogService.initialize().then(() => {
    console.log("Start the server");
    app.listen(HTTP_PORT, onHttpStart);
}).catch(() => {
    console.log("Unable to start the server");
})


