
const express = require('express');
const request = require('request');
const init = require('./public/js/init.js')
const generator = require('./public/js/generator.js')
const app = express();
var port = process.env.PORT || 3000;

app.set('views', __dirname + '/public/views')
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))

/*********************Init Stuff********************/
 
var categories
init.initCategories(__dirname + '/public/resources/categories.txt', (cats) => {
    
    categories = ['All'].concat(cats)
    if (cats.length == 0) {
        console.log('Empty Categories Initialized')
    } else {
        console.log('Categories Initialized')
    }
})

/*******************End Init Stuff********************/

app.post('/category/:cat/:number', (req, res) => {

    var cat = req.params.cat
    if (cat == 'All') {
        cat = ''
    }
    generator.generateQuestions(__dirname + '/public/resources/', req.params.number, cat, (questions) => {
        res.send({data: questions})
    })
})

app.get('/category/:category', (req, res) => {
    
    res.render('category', { category: {name: req.params.category } })
});

app.get('/home/:search', (req, res) => {

    sub = []
    criteria = req.params.search

    categories.forEach(cat => {
        if (cat.includes(criteria)) {
            sub.push(cat)
        }
    })
    res.render('home', { categories: {count: sub.length, data: sub } })
})

app.get('/', (req, res) => {

    res.render('home', { categories: {count: categories.length, data: categories } })
}); 

app.listen(port, () => {
  console.log(`Server Open on Port ${port}`)
})
