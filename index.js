const scanModules = require('./util/scanModules');

const scripts = {
    pre: scanModules('pre'),
    instance: scanModules('instance'),
    post: scanModules('post')
}

let exit = require(`./util/exit`)(scripts);

process.on('SIGINT', exit);
process.on('SIGTERM', exit);

console.log(scripts);

(async () => {
    try {
        console.log(`Running ${scripts.pre.length} pre script(s)...`);
    
        for(let script of scripts.pre) {
            console.log(`| Running ${script.name}...`);
            await script.module();
        };
    
        const instances = {};
        exit = require(`./util/exit`)(scripts, instances);
    
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
                instances[script.name].once('close', exit);
            }
    
            await instances[script.name].start();
    
            console.log(`| Instance ${script.name} started`);
        };
    } catch(e) {
        console.error(e);
        exit();
    }
})();