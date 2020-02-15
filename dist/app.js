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
        const canvas = document.getElementById('oscilloscope');
        this.recording = {
            status: RecordingStatus.READY,
            currentTime: 0
        };
        this.timerDate = new Date(0);
        this.timerElem = document.getElementById('timer');
        this.fileNameElem = document.getElementById('file-name');
        this.recordButton = document.getElementById('start-btn');
        this.stopButton = document.getElementById("stop-btn");
        // // this.pauseButton = document.getElementById("pause-btn") as HTMLButtonElement;
        this.resumeButton = document.getElementById("resume-btn");
        this.preview = document.getElementById("preview");
        this.init(canvas);
    }
    init(canvas) {
        this.setUIState(RecordingStatus.READY);
        this.userMedia = navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            this.preview.srcObject = stream;
            this.oscilloscope = new Oscilloscope(stream, canvas);
            return stream;
        });
        this.recordButton.addEventListener('click', async () => {
            if (this.recording.status === RecordingStatus.READY) {
                this.startRecording().then((file) => {
                    this.recording.file = file;
                    this.renderFileName();
                    this.startTimerInterval();
                    this.recording.status = RecordingStatus.RECORDING;
                    this.setUIState(RecordingStatus.RECORDING);
                }, (err) => {
                    console.log(err);
                });
            }
            else if (this.recording.status === RecordingStatus.PAUSED) {
                mediaLib.resume();
                this.startTimerInterval();
                this.recording.status = RecordingStatus.RECORDING;
                this.setUIState(RecordingStatus.RECORDING);
            }
            else if (this.recording.status === RecordingStatus.RECORDING) {
                mediaLib.pause();
                this.stopTimerInterval();
                this.recording.status = RecordingStatus.PAUSED;
                this.setUIState(RecordingStatus.PAUSED);
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
    }
    setUIState(recordingStatus) {
        const setButtonIcon = (element, iconName) => {
            if (element.firstElementChild) {
                element.firstElementChild.innerHTML = iconName;
            }
        };
        switch (recordingStatus) {
            case (RecordingStatus.READY): {
                // this.pauseButton.setAttribute('disabled', 'disabled');
                this.stopButton.setAttribute('disabled', 'disabled');
                setButtonIcon(this.recordButton, 'fiber_manual_record');
                break;
            }
            case (RecordingStatus.RECORDING): {
                // this.pauseButton.removeAttribute('disabled');
                this.stopButton.removeAttribute('disabled');
                setButtonIcon(this.recordButton, 'pause');
                break;
            }
            case (RecordingStatus.PAUSED): {
                // this.pauseButton.removeAttribute('disabled');
                this.stopButton.removeAttribute('disabled');
                setButtonIcon(this.recordButton, 'fiber_manual_record');
                break;
            }
        }
    }
    async startRecording() {
        const streamSource = await this.userMedia;
        const recorder = new MediaRecorder(streamSource);
        this.preview.captureStream(recorder);
        return await mediaLib.startRecording(recorder, this.maxBufferSize, this.storeEachMillis);
    }
    tick() {
        this.recording.currentTime += 1;
        this.updateTimerUI(this.recording.currentTime);
    }
    startTimerInterval() {
        this.timer = setInterval(() => {
            console.log('tick', this.recording.currentTime);
            this.tick();
        }, 1000);
    }
    stopTimerInterval() {
        clearInterval(this.timer);
    }
    resetTimer() {
        this.recording.currentTime = 0;
        this.updateTimerUI(0);
        this.stopTimerInterval();
    }
    updateTimerUI(val) {
        requestAnimationFrame(() => {
            this.timerDate.setSeconds(val);
            this.timerElem.innerText = new Date(1000 * val).toISOString().substr(11, 8);
        });
    }
    renderFileName() {
        this.fileNameElem.innerText = "Recording to: " + this.recording.file.name;
    }
}
new FSHelpers();
