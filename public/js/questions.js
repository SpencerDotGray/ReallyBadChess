const {spawn} = require('child_process');

function getQuestions(number, callback) {
    
    const python = spawn('python', ['python/generate.py', number]);
    python.stdout.on('data', function (data) {
        // console.log('Pipe data from python script ...');
        var d = data.toString().split('\n')
        d.pop(0)
        
        callback(d)
        return
    });
}

module.exports = { getQuestions };
