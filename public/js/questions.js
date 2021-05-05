const {spawn} = require('child_process');
const fs = require('fs')
const dfd = require('danfojs-node')

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


function removeQuotes(word) {
    ['"', "'", ','].forEach(ll => {
        while (word.includes(ll)) {
            word = word.replace(ll, '')
        }
    })
    return word
}

function replacePunc(word) {
    ['.', '!', '?'].forEach(ll => {
        while (word.includes(ll)) {
            word = word.replace(ll, ' ' + ll)
        }
    })
    return word
}

function generateStarters(category, mk, callback) {

    starters = {'data': []}
    console.log('Generating Starters')
    
    dfd.read_csv('JEOPARDY_CSV.csv')
        .then(df => {

            if (category != '') {
                df = df.query({"column": " Category", "is": "==", "to": category})
            }
            
            df[' Question'].values.forEach(question => {
                if (question.split(' ')[0] in mk.keys) {
                    starters['data'].append(question.split(' ')[0])
                }
            })

            callback(starters)
            
        }).catch(err => {
            console.log(err)
        }) 
}

function generateMarkovKey(category, callback) {

    mk = {}
    console.log('Generating MK')

    dfd.read_csv('JEOPARDY_CSV.csv')
        .then(df => {

            if (category != '') {
                df = df.query({"column": " Category", "is": "==", "to": category})
            }

            df[' Question'].values.forEach(question => {
                question = question + '.'
                question = removeQuotes(replacePunc(question))
                var words = question.split(' ')

                if (!question.includes('href=')) {

                    var i = 0
                    words.forEach(word => {

                        if (i != words.length-1 && word != '') {
                            var nw = words[index+1].trim()
                            if (mk.keys.includes(word) && nw != '') {
                                mk[word].append(nw)
                            } else if (!mk.keys.includes(word) && nw != '') {
                                mk[word] = [nw]
                            } else {
                                mk[word] = []
                            }
                        } else if (!mk.keys.includes(word) && word != '') {
                            mk[word] = []
                        }
                        i += 1
                    })
                }
            })

            callback(mk)

        }).catch(err => {
            console.log(err)
        })
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

function getCategories(callback) {

    dfd.read_csv('JEOPARDY_CSV.csv')
        .then(df => { 

            var output = ['None']

            df[' Category'].values.forEach(cat => {
                if (!output.includes(cat)) {
                    output.push(cat)
                }
            })

            callback(output)

        }).catch(err => {
            console.log(err)
            callback([])
        })
}

function getQuestions(number, category, callback) {

    var mkFile = 'datasets/markov' + category + '.json'
    var startFile = 'datasets/starter' + category + '.json'

    try {
        const jsonString = fs.readFileSync(mkFile)
        const mv = JSON.parse(jsonString)

        var starters

        try {
            const jsonString = fs.readFileSync(startFile)
            starters = JSON.parse(jsonString).starters
        } catch(err) {
            
            generateStarters(category, mv, (s) => {
                starters = s

                output = []

                for (var i = 0; i < number; i++) {
                    output.push(generateQuestion(6, 12, 25, mv, starters))
                }
                callback(output)
            })
        } finally {
            output = []

            for (var i = 0; i < number; i++) {
                output.push(generateQuestion(6, 12, 25, mv, starters))
            }
            callback(output)
        }
    } catch(err) {
        
        generateMarkovKey(category, (mk) => {

            var starters

            try {
                const jsonString = fs.readFileSync(startFile)
                starters = JSON.parse(jsonString).starters
            } catch(err) {
                
                generateStarters(category, mk, (s) => {
                    starters = s

                    output = []

                    for (var i = 0; i < number; i++) {
                        output.push(generateQuestion(6, 12, 25, mk, starters))
                    }
                    callback(output)
                })
            } finally {
                output = []

                for (var i = 0; i < number; i++) {
                    output.push(generateQuestion(6, 12, 25, mk, starters))
                }
                callback(output)
            }
        })
    }
}

module.exports = { getQuestions, getCategories };
