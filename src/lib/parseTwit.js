module.exports = function(twit) {
    const re = /^@\w{1,15}/i;
    if (twit.match(re) && twit.match(re)[0] === '@kijiji_node') {
        const text = twit.substring(13)
        if (lookForCoffee(text)) {
            return text;
        }
        return false
    }
    else {
        return false;
    }
}
const knownWords = ['coffee', 'americano', 'latte', 'psl'];
function lookForCoffee(str) {
    let switcher = false
    str.split(' ').forEach((word) => {
        if (knownWords.indexOf(word) > -1) {
            switcher = true;
        }
    })
    return switcher;

}
