class Apifeature {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: "i"
            }
        } : {}


        this.query = this.query.find({ ...keyword });
        return this;
    }

    // filter for removing values

    filter() {
        const querycopy = { ...this.queryStr };
        const removeList = ["keyword", "limit", "page"];

        removeList.forEach(key => delete querycopy[key])



        // filter for price gte or lte

        let queryStr = JSON.stringify(querycopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    pagination(currentProducts) {
        
        const page = this.queryStr.page * 1 || 1;
        const skip = currentProducts * (page - 1);

        this.query = this.query.limit(currentProducts).skip(skip);

        return this;
    }

}

module.exports = Apifeature