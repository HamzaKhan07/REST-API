const express = require('express')
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser') 

app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

//connection
mongoose.connect('mongodb://0.0.0.0:27017/wikiDB');

//schema and modelling
const wikiSchema = {
    title: String,
    content: String,
};
const Article = mongoose.model('Article', wikiSchema);

app.get('/', function(req, res){
    res.send('Hello World');
});

//GET
//all articles
app.get('/articles', function(req, res){
    getArticles().then(function(articles){
        res.send(articles);
    });
});

//POST
app.post('/articles', async function(req, res){
    const title = req.body.title;
    const content = req.body.content;
 
    const article = Article({
        title: title,
        content: content
    });

    const newArticle = await article.save();

    if(newArticle === article){
        res.send('Successfully created a new article');
    }
    else{
        res.end("Error creating article!");
    }
});

//DELETE
app.delete('/articles', function(req, res){
    deleteMany().then(function(){
        res.send('Successfully deleted all articles!');
    });
});


//////////Specific//////////
//get
app.get('/articles/:articleTitle', function(req, res){
    const articleTitle = req.params.articleTitle;

    getSpecificArticle(articleTitle).then(function(article){
        if(article.length > 0){
            return res.send(article);
        }
        else{
            res.send('Article not found!');
        }
    });

});

//put
app.put('/articles/:articleTitle', function(req, res){
    const paramTitle = req.params.articleTitle; 
    const title = req.body.title;
    const content = req.body.content;

    putUpdate(paramTitle, title, content).then(function(result){
        res.send(result.modifiedCount+" item(s) updated!");
    });

});

//patch
app.patch('/articles/:articleTitle', function(req, res){
    const paramTitle = req.params.articleTitle;

    // req.body = {
    //     title: 'some title',
    //     content: 'some content'
    // }

    patchUpdate(paramTitle, req.body).then(function(result){
        res.send(result.modifiedCount+" item(s) updated!");
    }); 
});

//delete
app.delete('/articles/:articleTitle', function(req, res){
    const title = req.params.articleTitle;

    deleteSpecificArticle(title).then(function(result){
        res.send(result.deletedCount+" item(s) deleted!");
    });
});
 



app.listen(3000, function(){
    console.log('listening on port 3000');
});

//helper functions
async function getArticles(){
    const articles = await Article.find({});
    return articles;
}

async function deleteMany(){
    await Article.deleteMany({});
}

async function getSpecificArticle(articleTitle){
    const article = await Article.find({title: articleTitle});
    return article;
}

async function putUpdate(paramTitle, title, content){
    const res = await Article.updateMany({title: paramTitle}, {title: title, content: content});
    return res;
}

async function patchUpdate(paramTitle, query){
    const res = await Article.updateOne({title: paramTitle}, {$set : query});
    return res;
}

async function deleteSpecificArticle(articleTitle){
    const res = await Article.deleteOne({title: articleTitle});
    return res;
};

