
import cats from "../resources/categories.json";

class JeopardyWorker {

    constructor() {
        this.categories = cats.categories;
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
}


export default JeopardyWorker;