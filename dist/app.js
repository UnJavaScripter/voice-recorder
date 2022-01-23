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
        this.timerRaf = 0;
        this.initialTimeDiff = 0;
        const canvas = document.getElementById('oscilloscope');
        this.recording = {
            status: RecordingStatus.READY
        };
        this.timerElem2 = document.getElementById('timer2');
        this.timerElem = document.getElementById('timer');
        this.fileNameElem = document.getElementById('file-name');
        this.recordButton = document.getElementById('start-btn');
        this.stopButton = document.getElementById("stop-btn");
        this.resumeButton = document.getElementById("resume-btn");
        this.preview = document.getElementById("preview");
        this.init(canvas);
    }
    init(canvas) {
        this.setUIState(RecordingStatus.READY);
        this.userMedia = navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
        }).then(stream => {
            this.preview.srcObject = stream;
            this.oscilloscope = new Oscilloscope(stream, canvas);
            return stream;
        });
        this.recordButton.addEventListener('pointerdown', async () => {
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
            if (this.recording.status === RecordingStatus.PAUSED) {
                mediaLib.resume();
            }
            mediaLib.stop();
            this.resetTimer();
            this.recording.status = RecordingStatus.READY;
            this.setUIState(RecordingStatus.READY);
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
                this.stopButton.setAttribute('disabled', 'disabled');
                setButtonIcon(this.recordButton, 'fiber_manual_record');
                break;
            }
            case (RecordingStatus.RECORDING): {
                this.stopButton.removeAttribute('disabled');
                setButtonIcon(this.recordButton, 'pause');
                break;
            }
            case (RecordingStatus.PAUSED): {
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
    startTimerInterval() {
        this.timerCurrentDate = new Date();
        if (!this.timerStartDate) {
            this.timerStartDate = new Date();
        }
        if (this.timerCurrentDate && this.timerStartDate) {
            const timeDelta = new Date(this.timerCurrentDate.getTime() - this.timerStartDate.getTime());
            const dateString = timeDelta.toISOString();
            this.updateTimerUI(dateString.substring(11, 19));
        }
        this.timerRaf = window.requestAnimationFrame(this.startTimerInterval.bind(this));
    }
    stopTimerInterval() {
        window.cancelAnimationFrame(this.timerRaf);
    }
    resetTimer() {
        this.timerStartDate = undefined;
        this.updateTimerUI('00:00:00');
        this.stopTimerInterval();
    }
    updateTimerUI(val) {
        this.timerElem.innerText = val;
    }
    renderFileName() {
        this.fileNameElem.innerText = "Recording to: " + this.recording.file.name;
    }
}
new FSHelpers();
