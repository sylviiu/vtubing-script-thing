const fs = require('fs');
const path = require('path');
const { compile } = require('nexe');

compile({
    clean: true,
}).then(() => {
    console.log(`compiling!`);

    compile({
        input: './index.js',
        build: true,
        resources: [
            `./util/**/*`,
            `./instance/**/*`,
            `./pre/**/*`,
            `./post/**/*`,
            `./core/**/*`,
        ],
        output: './build/vtube',
    })
})