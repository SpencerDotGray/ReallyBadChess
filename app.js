
const express = require('express');
const request = require('request');
const app = express();
const {spawn} = require('child_process');
var port = process.env.PORT || 3000;

app.set('views', __dirname + '/public/views')
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))

app.post('/:numQuestions', (req, res) => {

    console.log('post')
    const python = spawn('python', ['python/generate.py', req.params.numQuestions]);
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        var d = data.toString().split('\n')
        d.pop()

        res.send({ data: { found: true, questions: d, length: d.length } } )
    });
});

app.get('/', (req, res) => {

    res.render('question', {data: {found: false}})
}); 

// app.get('/', (req, res) => {
//     res.render('test')
// });

app.listen(port, () => {
  console.log(`Server Open on Port ${port}`)
})
