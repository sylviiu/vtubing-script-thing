let exiting = false;

module.exports = (instances, scripts) => {
    if(exiting) return false;

    exiting = true;

    return new Promise(async res => {
        console.log(`Murdering existing processes...`);

        for(let script of scripts.instance) {
            console.log(`| | Killing ${script.name}...`);
            if(typeof instances[script.name].stop == `function`) await instances[script.name].stop();
        };

        console.log(`Running post scripts...`);

        for(let script of scripts.post) {
            console.log(`| Running ${script.name}...`);
            await script.module();
        };

        console.log(`Exiting...`);

        process.exit(0);
    });
}