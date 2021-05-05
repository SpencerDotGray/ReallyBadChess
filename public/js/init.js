
const fs = require('fs')

function initCategories(file, callback) {

    fs.readFile(file, (err, data) => {
        if (err) { console.log(err); callback([]) }
        else {
            callback(data.toString().split('\n'))
        }
    })
}   

module.exports = { initCategories };