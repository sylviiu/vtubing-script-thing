const fs = require('fs');
const path = require(`path`);

module.exports = (dir) => fs.readdirSync(dir).filter(f => f.endsWith(`.js`)).map(file => ({
    name: file.split('.')[0],
    path: path.resolve(`${dir}/${file}`),
    module: require(`../${dir}/${file}`)
}))