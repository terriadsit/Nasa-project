const DEFAULT_PAGE_LIMIT = 0;
const DEFAULT_PAGE_NUMBER = 1;

function getPagination(query) {
    const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER; // if no query.page use default
    const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT; // Math.abs turn string into number
    const skip = (page - 1) * limit;

    return {
        skip,
        limit,
    };
}

module.exports = {
    getPagination
}