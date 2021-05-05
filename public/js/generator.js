
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

function generateQuestions(path, number, category, callback) {

    var keyFile = `${path}/markov${category}.json`
    var startFile = `${path}/markovStarters${category}.json`

    fs.readFile(keyFile, (err, data) => {
        if (err) { console.log(err); callback([]) }
        else {
            
            var mk = JSON.parse(data)

            fs.readFile(startFile, (err, data2) => {

                var starters = JSON.parse(data2).data

                if(err) {console.log(err); callback([]) }
                else {

                    var output = []

                    for (var i = 0; i < number; i++) {
                
                        var question = generateQuestion(mk, starters)
                        output.push(question)
                    }

                    callback(output)
                }
            })
        }
    })
}


function generateQuestion(mk, starters) {

    var min = 6
    var max = 12
    var cutoff = 25
    var dl = Math.floor(Math.random() * max+min) - min
    var i = 0
    var word = starters[Math.floor(Math.random() * starters.length)]
    var result = word

    while (i < cutoff) {

        word = advanceChain(word, (i > dl), mk)
        result = result + ' ' + word.trim()

        if (word == '.') {
            i = cutoff
        }

        i += 1
    }
    return result.replace(' .', '.').replace('?.', '?').replace(' ?', '?')

}

module.exports = { generateQuestions };