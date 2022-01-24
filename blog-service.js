var posts = [];
var categories = [];
const fs = require("fs");

module.exports.initialize = function() {
    return new Promise(function(resolve, reject){
        var readPosts = false;
        var readCategories = false;
        try {
            fs.readFile("./data/posts.json", "utf8", (err, data) => {
                if (err) throw err;
                posts = JSON.parse(data);
                readPosts = true;
                if (readCategories) {
                    resolve();
                }
            });
            fs.readFile("./data/categories.json", "utf8", (err, data) => {
                if (err) throw err;
                categories = JSON.parse(data);
                readCategories = true;
                if (readPosts) {
                    resolve();
                }
            });
        } catch (ex) {
            reject("Unable to read a file");
        }
    })
}

module.exports.getAllPosts = function(){
    return new Promise(function(resolve, reject){
        resolve(posts);
    })
}

module.exports.getPublishedPosts = function(){
    return new Promise(function(resolve, reject){
        let published_posts = [];
        for(let i=0;i<posts.length;i++){
            if(posts[i].published){
                published_posts.push(posts[i]);
            }
        }
        if (!published_posts.length){
            reject("No results returned");
        };
        resolve(published_posts);
    })
}

module.exports.getCategories = function(){
    return new Promise(function(resolve, reject){
        resolve(categories);
    })
}


