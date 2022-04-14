const alphabet = 'abcdefghijklmnopqrstuvwxyz';
const letter = () => {
    return alphabet.charAt(Math.floor(Math.random() * 27));
};

const device = casual => () => {
    const name = (letter() + letter()).toUpperCase();

    return `${name}-${casual.integer(1, 100)}`;
};

module.exports = (casual) => {
    casual.define('device', device(casual));
};
