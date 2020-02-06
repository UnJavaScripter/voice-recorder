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
            status: RecordingStatus.READY
        };
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
        this.startButton.addEventListener('click', () => {
            if (this.recording.status === RecordingStatus.READY) {
                this.start();
                this.recording.status = RecordingStatus.RECORDING;
            }
        });
        this.stopButton.addEventListener('click', () => {
            if (this.recording.status === RecordingStatus.RECORDING) {
                mediaLib.stop();
                this.recording.status = RecordingStatus.READY;
            }
        });
        this.pauseButton.addEventListener('click', () => {
            if (this.recording.status === RecordingStatus.PAUSED) {
                mediaLib.resume();
                this.recording.status = RecordingStatus.RECORDING;
            }
            else {
                mediaLib.pause();
                this.recording.status = RecordingStatus.PAUSED;
            }
        });
    }
    start() {
        this.userMedia.then((stream) => {
            const recorder = new MediaRecorder(stream);
            this.preview.captureStream(recorder);
            mediaLib.startRecording(recorder, this.maxBufferSize, this.storeEachMillis);
        });
    }
}
new FSHelpers();
