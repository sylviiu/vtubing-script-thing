const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const findFirstDir = (dir) => fs.readdirSync(dir).find(x => fs.statSync(`${dir}/${x}`).isDirectory());

module.exports = class FaceTracker extends EventEmitter {
    constructor() {
        super();

        this.cwd = path.resolve(`../${fs.readdirSync(`../`).find(x => x.startsWith(`VSeeFace`) && fs.statSync(`../${x}`).isDirectory())}`);
        while(!fs.readdirSync(this.cwd).includes(`VSeeFace.exe`)) this.cwd = path.resolve(`${this.cwd}/${findFirstDir(this.cwd)}`);

        console.log(`Found VSeeFace in ${this.cwd}`);
    }

    start() {
        return new Promise(async res => {
            if(this.resurrect && this.process && !this.process.killed) await new Promise(async res => {
                this.process.on('close', res);
                this.process.kill('SIGINT');
            });
    
            this.process = child_process.spawn('./VSeeFace.exe', [], {
                cwd: this.cwd,
                stdio: 'inherit'
            });
    
            this.process.on('close', code => {
                console.log(`VSeeFace exited with code ${code}`);
                this.emit('close', code);
            });
    
            this.process.on('error', err => {
                console.log(`VSeeFace errored with ${err}`);
                this.emit('error', err);
            });

            this.process.once('spawn', res);
        });
    }
};