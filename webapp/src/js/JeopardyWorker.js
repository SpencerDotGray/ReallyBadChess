
import cats from "../resources/categories.json";
import ds from '../resources/Dataset.json';
import { useEffect } from 'react';

class JeopardyWorker {

    constructor() {
        this.categories = cats.categories;
        this.dataset = ds['data'];

        // this.categories = [];
        // this.dataset = [];
    }

    getCategories(callback) {
        callback(this.categories);
    }

    refineCategories(criteria, callback) {

        const returnVal = []
        this.categories.forEach( cat => {

            if (cat.toLowerCase().includes(criteria.toLowerCase())) {
                returnVal.push(cat);
            }
        })
        callback(returnVal)
    }

    getRefinedQuestions(category, callback) {

        const returnVal = []
        this.dataset.forEach( entry => {

            var cat = entry.Category;
            cat = cat.replace('/', '-');
            cat = cat.replace('"', '');
            cat = cat.replace("'", '');
            if (cat === category) {

                returnVal.push(entry.Question)
            }
        })

        callback(returnVal)
    }
}


export default JeopardyWorker;