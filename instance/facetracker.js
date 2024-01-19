const EventEmitter = require('events');
const path = require('path');
const child_process = require('child_process');

const config = require(`../config.json`).facetracker;

const dcapRegex = /([\S]+: [\S]+)/g;

module.exports = class FaceTracker extends EventEmitter {
    constructor() {
        super();

        console.log(`Launching FaceTracker...`);

        this.cwd = path.resolve(`../facetracker`);

        const cameras = child_process.spawnSync('facetracker.exe', ['-l', '1'], { cwd: this.cwd }).stdout.toString().split(`\n`).filter(x => !isNaN(x[0])).map(x => [x.split(`: `)[0], x.split(`: `).slice(1).join(`: `).slice(0, -1)]);

        let foundCamera = cameras.find(x => x[1] === config.device.name);
        if(!foundCamera) foundCamera = cameras.find(x => x[1].startsWith(config.device.name));
        if(!foundCamera) foundCamera = cameras.find(x => x[1].includes(config.device.name));
        if(!foundCamera) throw new Error(`Could not find camera ${config.device.name}`);

        console.log(`\n\n-------------\n${cameras.length} camera(s) found\n| ${cameras.map(x => x[1]).join(`\n| `)}\n\nLooking for: ${config.device.name} (resolved: ${foundCamera[0]} - ${foundCamera[1]})\n-------------\n`);
        this.camId = foundCamera[0];

        const cameraDCaps = child_process.spawnSync('facetracker.exe', ['-c', `${this.camId}`, `-a`, `1`], { cwd: this.cwd }).stdout.toString().split(`\n`).map(s => s.trim()).filter(x => !isNaN(x[0])).map(x => [
            x.split(`: `)[0], 
            x.split(`: `).slice(1).join(`: `).match(dcapRegex).map(s => [s.split(`:`)[0], s.split(`:`).slice(1).join(`:`)].map(s => s.trim())).reduce((a, b) => ({ ...a, [b[0]]: b[1] }), {})
        ]);

        let foundDCap = cameraDCaps.find(x => x[0] == config.device.dCap);
        if(!foundDCap) throw new Error(`Could not find dCap ${config.device.dCap}`);

        console.log(`\n\n-------------\n${cameraDCaps.length} dCap(s) found\n\n${cameraDCaps.map(x => `DCap ${x[0]}: \n| ${Object.entries(x[1]).map(([a,b]) => `${a}: ${b}`).join(`\n| `)}\n`).join(`\n`)}\n\nLooking for: ${config.device.dCap} (resolved: ${foundDCap[0]})\n-------------\n`);
        this.dcap = foundDCap[0];

        this.width = foundDCap[1].Resolution.split(`x`)[0];
        this.height = foundDCap[1].Resolution.split(`x`)[1];

        this.ip = config.location.split(`:`)[0];
        this.port = config.location.split(`:`)[1] || null;
    }

    resurrect = true;

    stop() {
        this.resurrect = false;
        if(this.process && !this.process.killed) this.process.kill();
    }

    start() {
        if(!this.resurrect) return false;

        return new Promise(async res => {
            if(this.resurrect && this.process && !this.process.killed) await new Promise(async res => {
                this.process.on('close', res);
                this.process.kill('SIGINT');
            });
    
            this.process = child_process.spawn('facetracker.exe', [
                '-s', '1', // silent
    
                '-c', `${this.camId}`,
                '-D', `${this.dcap}`,
    
                '-W', `${this.width}`, // width
                '-H', `${this.height}`, // height
                ...(config.device.frameRate ? ['-F', `${config.device.frameRate}`] : []),
    
                ...(config.model ? ['--model', `${config.model}`] : []), // model
    
                ...(config.mirrored ? ['-M'] : []), // mirror
    
                '-i', `${this.ip}`, 
                '-p', `${this.port}`,
            ], {
                cwd: this.cwd,
                stdio: 'inherit'
            });
    
            this.process.on('close', code => {
                console.log(`FaceTracker exited with code ${code}`);
                
                if(this.resurrect) {
                    console.log(`FaceTracker is resurrectable; restarting...`);
                    this.start();
                } else this.emit('close', code)
            });
    
            this.process.on('error', err => {
                console.log(`FaceTracker errored with ${err}`);
                this.emit('error', err);
            });

            this.process.once('spawn', res);
        });
    }
};