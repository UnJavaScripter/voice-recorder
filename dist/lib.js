"use strict";
class MediaLib {
    getFileHandle() {
        const handle = window.chooseFileSystemEntries();
        return handle;
    }
    getNewFileHandle() {
        const opts = {
            type: 'saveFile',
            accepts: [{
                    description: 'Audio file',
                    extensions: ['mp3'],
                    mimeTypes: ['audio/mpeg'],
                }],
        };
        const handle = window.chooseFileSystemEntries(opts);
        return handle;
    }
    async startRecording(recorder, maxBufferSize = 100, storeEachMillis = 1000) {
        let data = [];
        this.recorder = recorder;
        if (!this.fileHandle) {
            this.fileHandle = await this.getNewFileHandle();
        }
        else {
            this.fileHandle = await this.getFileHandle();
        }
        console.log(this.fileHandle.size);
        debugger;
        this.recorder.ondataavailable = (event) => {
            console.log('ondataavailable', event.data);
            if (data.length >= maxBufferSize) {
                data.length = 0;
            }
            data.push(event.data);
            const recordedBlob = new Blob(data, { type: "video/webm" });
            this.writeFile(this.fileHandle, recordedBlob);
        };
        this.recorder.start(storeEachMillis);
        console.log(this.recorder.state);
        let stopped = new Promise((resolve, reject) => {
            this.recorder.onstop = resolve;
            this.recorder.onerror = (event) => reject(event); //event.name
        });
        return Promise.all([
            stopped,
        ])
            .then(() => {
            console.log('recorded!!', data);
            return data;
        });
    }
    async writeFile(fileHandle, contents) {
        const writer = await fileHandle.createWriter({ keepExistingData: true });
        console.log(contents);
        await writer.write(0, contents);
        console.log('will write', contents);
        await writer.close();
    }
    stop() {
        this.recorder.stop();
    }
    pause() {
        this.recorder.pause();
    }
    resume() {
        this.recorder.resume();
    }
}
