const {spawn} = require('child_process');
const fs = require('fs')

function advanceChain(word, end, mv) {

    if ((end && mv[word].includes('.')) || (end && mv[word].includes('?')) || (mv[word].length == 0)) {
        if (mv[word].includes('?')) {
            return '?'
        }
        return '.'
    } else {
        var index = Math.floor(Math.random() * mv[word].length)
        return mv[word][index]
    }
}


function generateQuestion(min, max, cutoff, mv) {

    var dl = Math.floor(Math.random() * max+min) - min
    var i = 0
    var words = mv.keys
    var word = words[Math.floor(Math.random() * words.length)]
    var result = word

    while (i < cutoff) {

        word = advanceChain(word, (i > dl), mv)
        result = result + ' ' + word.trim()

        if (word == '.') {
            i = cutoff
        }

        i += 1
    }
    return result
}

function getQuestions(number, callback) {
    
    // const python = spawn('python', ['python/generate.py', number]);
    // python.stdout.on('data', function (data) {
    //     // console.log('Pipe data from python script ...');
    //     var d = data.toString().split('\n')
    //     d.pop(0)
        
    //     callback(d)
    //     return
    // });

    try {
        const jsonString = fs.readFileSync('./markov.json')
        const mv = JSON.parse(jsonString)

        output = []

        for (var i = 0; i < number; i++) {
            output.push(generateQuestion(6, 12, 25, mv))
        }
        callback(output)
    } catch(err) {
        console.log(err)
        return []
    }
}

module.exports = { getQuestions };
