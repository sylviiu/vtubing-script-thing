const fs = require(`fs`);
const recursiveAssign = require(`../util/recursiveAssign`);

const defaults = {
    hass: {
        token: "token",
        location: "http://192.168.68.50:8123",
        devices: [
            "light.1",
            "light.2"
        ]
    },

    facetracker: {
        device: {
            name: "USB Live camera",
            dCap: 1,
            frameRate: 60
        },
        model: 1,
        mirrored: true,
        threads: 1,
        location: "127.0.0.1:11573"
    }
}

const end = !fs.existsSync(`./config.example.json`) && !fs.existsSync(`./config.json`)

fs.writeFileSync(`./config.example.json`, JSON.stringify(defaults, null, 4));

if(end) {
    console.log(`No config file was found! A config.example.json template file has been created for you. Please rename it to config.json and fill in the values.`);
    return process.exit(1);
}

let config = {};

try {
    config = require(`../config.json`);
} catch(e) { config = {} }

module.exports = recursiveAssign(defaults, config);

fs.writeFileSync(`./config.json`, JSON.stringify(module.exports, null, 4));