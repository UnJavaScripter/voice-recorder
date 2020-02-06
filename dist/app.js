"use strict";
const mediaLib = new MediaLib();
var RecordingStatus;
(function (RecordingStatus) {
    RecordingStatus[RecordingStatus["READY"] = 0] = "READY";
    RecordingStatus[RecordingStatus["RECORDING"] = 1] = "RECORDING";
    RecordingStatus[RecordingStatus["PAUSED"] = 2] = "PAUSED";
})(RecordingStatus || (RecordingStatus = {}));
class FSHelpers {
    constructor() {
        this.maxBufferSize = 100;
        this.storeEachMillis = 1000;
        this.recording = {
            status: RecordingStatus.READY,
            currentTime: 0
        };
        this.timerElem = document.getElementById('timer');
        this.startButton = document.getElementById('start-btn');
        this.stopButton = document.getElementById("stop-btn");
        this.pauseButton = document.getElementById("pause-btn");
        this.resumeButton = document.getElementById("resume-btn");
        this.preview = document.getElementById("preview");
        this.userMedia = navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            this.preview.srcObject = stream;
            return stream;
        });
        this.startButton.addEventListener('click', async () => {
            if (this.recording.status === RecordingStatus.READY) {
                this.start().then(() => {
                    this.startTimer();
                    this.recording.status = RecordingStatus.RECORDING;
                });
            }
            else if (this.recording.status === RecordingStatus.PAUSED) {
                mediaLib.resume();
                this.startTimer();
                this.recording.status = RecordingStatus.RECORDING;
            }
        });
        this.stopButton.addEventListener('click', () => {
            if (this.recording.status === RecordingStatus.RECORDING) {
                mediaLib.stop();
                this.resetTimer();
                this.recording.status = RecordingStatus.READY;
            }
            else if (this.recording.status === RecordingStatus.PAUSED) {
                mediaLib.resume();
                mediaLib.stop();
                this.resetTimer();
                this.recording.status = RecordingStatus.READY;
            }
        });
        this.pauseButton.addEventListener('click', () => {
            if (this.recording.status === RecordingStatus.PAUSED) {
                mediaLib.resume();
                this.startTimer();
                this.recording.status = RecordingStatus.RECORDING;
            }
            else if (this.recording.status === RecordingStatus.RECORDING) {
                mediaLib.pause();
                this.stopTimer();
                this.recording.status = RecordingStatus.PAUSED;
            }
        });
    }
    async start() {
        const streamSource = await this.userMedia;
        const recorder = new MediaRecorder(streamSource);
        this.preview.captureStream(recorder);
        return await mediaLib.startRecording(recorder, this.maxBufferSize, this.storeEachMillis);
    }
    tick() {
        this.recording.currentTime += 1;
        this.timerElem.innerText = this.recording.currentTime;
    }
    startTimer() {
        this.timer = setInterval(() => {
            console.log('tick', this.recording.currentTime);
            this.tick();
        }, 1000);
    }
    stopTimer() {
        clearInterval(this.timer);
    }
    resetTimer() {
        this.recording.currentTime = 0;
        this.timerElem.innerText = 0;
        this.stopTimer();
    }
}
new FSHelpers();
