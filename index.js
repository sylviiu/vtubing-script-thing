const fs = require('fs');
const scanModules = require('./util/scanModules');

const scripts = {
    pre: scanModules('pre'),
    instance: scanModules('instance'),
    //post: scanModules('post')
}

console.log(scripts);

(async () => {
    console.log(`Running ${scripts.pre.length} pre script(s)...`);

    for(let script of scripts.pre) {
        console.log(`| Running ${script.name}...`);
        await script.module();
    };

    const instances = {};

    console.log('Creating instances');

    for(let script of scripts.instance) {
        console.log(`| Creating instance ${script.name}...`);
        instances[script.name] = new script.module();
    };

    console.log('Starting instances');

    for(let script of scripts.instance) {
        console.log(`| Starting instance ${script.name}...`);

        if(!instances[script.name].resurrect) {
            console.log(`| | Instance ${script.name} is not resurrectable; killing process when this dies...`);

            instances[script.name].once('close', async () => {
                console.log(`| Instance ${script.name} died; killing processes...`);

                for(let script of scripts.instance) {
                    console.log(`| | Killing ${script.name}...`);
                    if(typeof instances[script.name].stop == `function`) await instances[script.name].stop();
                };

                console.log(`| Killing process...`);

                process.exit();
            });
        }

        await instances[script.name].start();

        console.log(`| Instance ${script.name} started`);
    };
})();