
exports.getDate = function() {

    const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
    };

    const today = new Date();
    return today.toLocaleDateString('en-IN', options);


};
