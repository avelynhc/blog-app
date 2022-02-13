var posts = [];
var categories = [];
const fs = require("fs");

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        let readPosts = false;
        let readCategories = false;
        try {
            fs.readFile("./data/posts.json", "utf8", (err, data) => {
                if (err) throw err;
                console.log(data);
                posts = JSON.parse(data);
                readPosts = true;
                if (readCategories) {
                    resolve();
                }
            });
            fs.readFile("./data/categories.json", "utf8", (err, data) => {
                if (err) throw err;
                console.log(data);
                categories = JSON.parse(data);
                readCategories = true;
                if (readPosts) {
                    resolve();
                }
            });
        } catch(ex) {
            reject("unable to read a file");
        }
    })
}

module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        if (!posts.length) reject("no results found");
        resolve(posts);
    })
}

module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        let published_posts = [];
        for(let i=0;i<posts.length;i++){
            if(posts[i].published){
                published_posts.push(posts[i]);
            }
        }
        if (!published_posts.length) reject("no results returned");
        resolve(published_posts);
    })
}

module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        if (!categories.length) reject("no results returned");
        resolve(categories);
    })
}

module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        postData.published = true;
        if (postData.published === null) postData.published = false;
        postData.id = posts.length + 1;
        postData.category = parseInt(postData.category);
        posts.push(postData);
        resolve();
    })
}

module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        let categorized_posts = [];
        for(let i=0;i<posts.length;i++) {
            if (posts[i].category == category) {
                categorized_posts.push(posts[i]);
            }
        }
        if (!categorized_posts.length) reject("no results returned");
        resolve(categorized_posts);
    })
}

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        let dated_posts = [];
        for(let i=0;i<posts.length;i++) {
            if (new Date(posts[i].postDate) >= new Date(minDateStr)) {
                dated_posts.push(posts[i]);
            }
        }
        if (!dated_posts.length) reject("no results returned");
        resolve(dated_posts);
    })
}

module.exports.getPostByID = (id) => {
    return new Promise((resolve, reject) => {
        let post_by_id = [];
        for(let i=0;i<posts.length;i++) {
            if (posts[i].id == id) {
                post_by_id.push(posts[i]);
            }
        }
        if (!post_by_id.length) reject("no results returned");
        resolve(post_by_id);
    })
}
