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

        // if (!end) {
        //     while (mv[word].includes('.') && mv[word].length > 1 && mv[word][index] == '.') {
        //         index = Math.floor(Math.random() * mv[word].length)
        //     }
        // }
        // return mv[word][index]

        return mv[word][index]
    }
}


function generateQuestion(min, max, cutoff, mv, starters) {

    var dl = Math.floor(Math.random() * max+min) - min
    var i = 0
    var word = starters[Math.floor(Math.random() * starters.length)]
    var result = word

    while (i < cutoff) {

        word = advanceChain(word, (i > dl), mv)
        result = result + ' ' + word.trim()

        if (word == '.') {
            i = cutoff
        }

        i += 1
    }
    return result.replace(' .', '.').replace('?.', '?').replace(' ?', '?')
}

function getQuestions(number, callback) {

    try {
        const jsonString = fs.readFileSync('./markov.json')
        const mv = JSON.parse(jsonString)

        var starters

        try {
            const jsonString = fs.readFileSync('./markovStarters.json')
            starters = JSON.parse(jsonString).starters
        } catch(err) {
            console.log('Using random words instead of starters')
            starters = mv.keys
        }

        output = []

        for (var i = 0; i < number; i++) {
            output.push(generateQuestion(6, 12, 25, mv, starters))
        }
        callback(output)
    } catch(err) {
        console.log(err)
        return []
    }
}

module.exports = { getQuestions };
