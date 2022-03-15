const Sequelize = require('sequelize');
const env = require('dotenv')
env.config()

var sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
})

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
})

Post.belongsTo(Category, {foreignKey: 'category'});

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
        .then(() => {
            console.log('sucessfully sync the database');
            resolve();
        }).catch(error => {
            console.log(error);
            reject('unable to sync the database');
        })
    })
}

module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll()
        .then(data => {
            resolve(data);
        }).catch(() => {
            reject('no results returned');
        })
    })
}

module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: category
            }
        })
        .then(data => {
            resolve(data);
        }).catch(() => {
            reject('no results returned');
        })
    })
}

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }        
            }
        })
        .then(data => {
            resolve(data);
        }).catch(() => {
            reject('no results returned');
        })
    })
}

module.exports.getPostByID = (id) => { 
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: id
            }
        })
        .then(data => {
            resolve(data[0]);
        }).catch(() => {
            reject('no results returned');
        })
    })
}

module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for (const prop in postData) {
            if (!postData[prop]) {
                postData[prop] = null;
            }
        }
        postData.postDate = new Date();
        Post.create(postData)
        .then(() => {
            resolve();
        }).catch(() => {
            reject('unable to create post');
        })
    })
}

module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        }).then(data => {
            resolve(data);
        }).catch(() => {
            reject('no results returned');
        })
    })
}

module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        }).then(data => {
            resolve(data);
        }).catch(() => {
            reject('no results returned');
        })
    })
}

module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll()
        .then(data => {
            resolve(data);
        }).catch(() => {
            reject('no results returend');
        })
    })
}

module.exports.addCategory = categoryData => {
    return new Promise((resolve, reject) => {
        for (const prop in categoryData) {
            if (!categoryData[prop]) {
                categoryData[prop] = null;
            }
        }
        Category.create(categoryData)
        .then(() => {
            resolve();
        }).catch(() => {
            reject('unable to create category');
        })
    })
}

module.exports.deleteCategoryById = id => {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id
            }
        }).then(() => {
            console.log("is this working?")
            resolve('destroyed');
        }).catch(() => {
            console.log("is this working?")
            reject('unable to delete category');
        })
    })
}

module.exports.deletePostById = id => {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {
                id: id
            }
        }).then(() => {
            resolve('destroyed');
        }).catch(() => {
            reject('unable to delete post');
        })
    })
}