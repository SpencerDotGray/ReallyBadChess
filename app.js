
const express = require('express');
const request = require('request');
const generator = require('./public/js/questions.js')
const app = express();
var port = process.env.PORT || 3000;
var questions = {}
var categories = []
generator.getCategories((cats) => {
    categories = cats
    console.log('Categories Generated!')

    categories.forEach(cat => {
        questions[cat] = []
    })
})

app.set('views', __dirname + '/public/views')
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))

app.post('/:numQuestions/:category', (req, res) => {

    if (isNaN(req.params.numQuestions)) {
        res.send({data: {found: false, nan: true}})
    } else if (req.params.numQuestions > 1000) {
        res.send({data: {found: false, toomany: true}})
    } else if (req.params.numQuestions < 0) {
        res.send({data: {found: false, negative: true}})
    } else if (questions[req.params.category].length >= req.params.numQuestions) {

        questions[req.params.category].pop(0)
        var d = questions[req.params.category].slice(0, req.params.numQuestions)
        questions[req.params.category] = questions[req.params.category].slice(req.params.numQuestions+1, questions.length)
        res.send({data: {found: true, questions: d, length: d.length}})

        generator.getQuestions(req.params.numQuestions + 2, req.params.category, (list) => {
            questions[req.params.category] = questions[req.params.category].concat(list)
        })
    } else {
        res.send({data: {found: false, length: req.params.numQuestions, toomany: false}})
        generator.getQuestions(1000, req.params.category, (list) => {
            console.log('Compiled List')
            questions[req.params.category] = questions[req.params.category].concat(list)
        })
    }
});

app.get('/', (req, res) => {

    res.render('question', {data: {found: false}, cats: categories})
}); 

app.listen(port, () => {
  console.log(`Server Open on Port ${port}`)
})
