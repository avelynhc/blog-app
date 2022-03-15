/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Hyunjeong Choi Student ID: 143281202 Date: March 14th. 2022
*
*  Online (Heroku) URL: https://desolate-spire-35018.herokuapp.com
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
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
const blogData = require('./blog-service');

app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }        
    }
}));
app.set('view engine', '.hbs');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true
});

const HTTP_PORT = process.env.PORT || 8080;
const onHttpStart = () => console.log(`Express http server listening on port ${HTTP_PORT} 🚀🚀🚀`);

app.use(express.static('public')); 
const upload = multer(); 

app.use(express.urlencoded({extended: true}));

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
    app.locals.viewingCategory = req.query.category;
    next();
});

app.get("/", (req,res) => {
    res.redirect('/blog');
});

app.get("/about", (req, res) => {
    res.render(path.join(__dirname + '/views/about.hbs'));
});

app.get("/posts/add", (req, res) => {
    blogService.getCategories()
    .then(data => {
        res.render("addPost", {categories: data});
    }).catch(() => {
        res.render("addPost", {categories: []});
    })
});

app.get('/categories/add', (req, res) => {
    res.render(path.join(__dirname + '/views/addCategory.hbs'));
});

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
    if (!req.file) {
        req.body.featureImage = null;
        blogService.addPost(req.body)
        .then(() => {
            res.redirect("/posts");
        }).catch(error => {
            console.log(error);
            res.status(500).send(error);
        })
    } else {
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;    
        }
        upload(req).then((uploaded) => {
            console.log(req.body.featureImage)
            req.body.featureImage = uploaded.url;
            blogService.addPost(req.body)
            .then(() => {
                res.redirect("/posts");
            }).catch((error) => res.status(500).send(error));
        }).catch((error) => res.status(500).send(error));
    }
});

app.post('/categories/add', (req, res) => {
    blogService.addCategory(req.body)
    .then(() => res.redirect("/categories"))
    .catch((error) => res.status(500).send(error));
});

app.get('/categories/delete/:id', (req, res) => {
    blogService.deleteCategoryById(req.params.id)
    .then(() => {
        res.redirect('/categories');
    }).catch(() => {
        res.status(500).send('Unable to remove category/ category not found');
    })
});

app.get('/posts/delete/:id', (req, res) => {
    blogService.deletePostById(req.params.id)
    .then(() => {
        res.redirect('/posts');
    }).catch(() => {
        res.status(500).send('Unable to remove post/ post not found');
    })
});

app.get("/blog", async (req, res) => {
    let viewData = {};
    try{
        let posts = [];
        if(req.query.category){
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            posts = await blogData.getPublishedPosts();
        }
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        let post = posts[0]; 
        viewData.posts = posts;
        viewData.post = post;
    }catch(err){
        viewData.message = 'no results';
    }

    try{
        let categories = await blogData.getCategories();
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = 'no results';
    }
    res.render('blog', {data:viewData});
});

app.get('/blog/:id', async (req, res) => {
    let viewData = {};
    try{
        let posts = [];
        if(req.query.category){
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            posts = await blogData.getPublishedPosts();
        }
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        viewData.posts = posts;
    }catch(err){
        viewData.message = "no results";
    }
    try{
        posts = await blogData.getPostByID(req.params.id);
        viewData.post = posts;
    }catch(err){
        console.log(err)
        viewData.message = "no results"; 
    }

    try{
        let categories = await blogData.getCategories();
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
    res.render("blog", {data: viewData})
});

app.get("/posts", (req, res) => {
    if (req.query.category) {
        blogService.getPostsByCategory(req.query.category).then((data) => {
            if (data.length > 0) {
                res.render('posts', {posts:data});
            } else {
                res.render('posts', {message: 'no results'});
            }
        }).catch((err) => res.render('posts', {message: 'no results'}));
    } else if (req.query.minDate) {
        blogService.getPostsByMinDate(req.query.minDate).then((data) => {
            if (data.length > 0) {
                res.render('posts', {posts:data});
            } else {
                res.render('posts', {message: 'no results'});
            }
        }).catch((err) => res.render('posts', {message: 'no results'}));
    } else {
        blogService.getAllPosts().then((data) => {
            if (data.length > 0) {
                res.render('posts', {posts:data});
            } else {
                res.render('posts', {message: 'no results'});
            }
        }).catch((err) => res.render('posts', {message: 'no results'}));
    }
})

app.get("/post/:value", (req, res) => {
    blogService.getPostByID(req.params.value).then((data) => {
        res.render('posts', {posts:data});
    }).catch((err) => res.render('posts', {message: 'no results'}));
})

app.get("/categories", (req, res) => {
    blogService.getCategories().then((data) => {
        if (data.length > 0) {
            res.render("categories", {categories: data});
        } else {
            res.render('categories', {message: 'no results'});
        }
    }).catch((err) => res.render("categories", {message: 'no results'}))
})

app.use((req, res) => {
    res.render('404', {message: 'no results'});
})

blogService.initialize().then(() => {
    console.log("start the server");
    app.listen(HTTP_PORT, onHttpStart);
}).catch(() => console.log("unable to start the server"))
