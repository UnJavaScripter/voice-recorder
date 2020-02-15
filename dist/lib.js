"use strict";
class MediaLib {
    getNewFileHandle() {
        const opts = {
            type: 'saveFile',
            accepts: [{
                    description: 'Video file',
                    extensions: ['mp4'],
                    mimeTypes: ['video/mp4'],
                }],
        };
        const handle = window.chooseFileSystemEntries(opts);
        return handle;
    }
    async startRecording(recorder, maxBufferSize = 100, storeEachMillis = 1000) {
        let data = [];
        this.recorder = recorder;
        try {
            this.fileHandle = await this.getNewFileHandle();
        }
        catch (err) {
            // console.log('err', err)
            return Promise.reject(err);
        }
        // console.log(this.fileHandle.size)
        this.recorder.ondataavailable = (event) => {
            // console.log('ondataavailable', event.data)
            if (data.length >= maxBufferSize) {
                data.length = 0;
            }
            data.push(event.data);
            const recordedBlob = new Blob(data, { type: "video/webm" });
            this.writeFile(this.fileHandle, recordedBlob);
        };
        this.recorder.start(storeEachMillis);
        // console.log(this.recorder.state);
        return this.fileHandle.getFile();
    }
    async writeFile(fileHandle, contents) {
        const writer = await fileHandle.createWriter({ keepExistingData: true });
        // console.log(contents)
        await writer.write(0, contents);
        // console.log('will write', contents)
        await writer.close();
        let stopped = new Promise((resolve, reject) => {
            this.recorder.onstop = resolve;
            this.recorder.onerror = (event) => reject(event); //event.name
        });
        return Promise.all([
            stopped,
        ])
            .then(() => {
            // console.log('%c==============================================', 'color: darkslategray; background-color: yellow')
            // console.log('recorded!!', contents)
            return contents;
        });
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
