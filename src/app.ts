const mediaLib = new MediaLib();

enum RecordingStatus {
  READY,
  RECORDING,
  PAUSED
}

class FSHelpers {
  recordButton: HTMLElement;
  stopButton: HTMLElement;
  pauseButton: HTMLMediaElement | any;
  resumeButton: HTMLMediaElement | any;
  preview: HTMLMediaElement | any;
  timerElem: HTMLMediaElement | any;
  timerElem2: HTMLMediaElement | any;
  fileNameElem: HTMLMediaElement | any;
  mediaStream: MediaStream;
  recording: any;
  timerStartDate: Date | undefined;
  timerCurrentDate: Date | undefined;
  maxBufferSize: number = 100;
  storeEachMillis: number = 1000;
  timerRaf: number = 0;
  oscilloscope: any;
  oscElem: any;

  initialTimeDiff: number = 0;

  constructor() {
    this.oscElem = document.getElementById('osc');
    this.recording = {
      status: RecordingStatus.READY
    }

    this.timerElem2 = document.getElementById('timer2') as HTMLElement;

    this.timerElem = document.getElementById('timer') as HTMLElement;
    this.fileNameElem = document.getElementById('file-name') as HTMLElement;
    this.recordButton = document.getElementById('start-btn') as HTMLButtonElement;
    this.stopButton = document.getElementById("stop-btn") as HTMLButtonElement;

    this.resumeButton = document.getElementById("resume-btn") as HTMLButtonElement;

    this.preview = document.getElementById("preview") as HTMLMediaElement;

    this.init();
  }

  async init() {
    this.setUIState(RecordingStatus.READY);
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    })
    
    this.preview.srcObject = this.mediaStream;
    this.oscElem.setStream(this.mediaStream);
    this.oscElem.start();

    this.recordButton.addEventListener('pointerdown', async () => {
      if (this.recording.status === RecordingStatus.READY) {
        this.startRecording().then((file) => {
          this.recording.file = file;
          this.renderFileName();
          this.startTimerInterval();
          this.recording.status = RecordingStatus.RECORDING;
          this.setUIState(RecordingStatus.RECORDING);
        }, (err: Error) => {
          console.log(err)
        });
      } else if (this.recording.status === RecordingStatus.PAUSED) {
        mediaLib.resume();
        this.startTimerInterval();
        this.recording.status = RecordingStatus.RECORDING;
        this.setUIState(RecordingStatus.RECORDING);
      } else if (this.recording.status === RecordingStatus.RECORDING) {
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

  private setUIState(recordingStatus: RecordingStatus) {
    const setButtonIcon = (element: HTMLElement, iconName: string): void => {
      if (element.firstElementChild) {
        element.firstElementChild.innerHTML = iconName;
      }
    }
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

  private async startRecording() {
    const streamSource = await this.mediaStream;
    const recorder = new MediaRecorder(streamSource);
    this.preview.captureStream(recorder);

    return await mediaLib.startRecording(
      recorder,
      this.maxBufferSize,
      this.storeEachMillis
    );

  }
  startTimerInterval(): void {
    this.timerCurrentDate = new Date();
    if(!this.timerStartDate) {
      this.timerStartDate = new Date();
    }
    if(this.timerCurrentDate && this.timerStartDate) {
      const timeDelta = new Date(this.timerCurrentDate.getTime() - this.timerStartDate.getTime())
      const dateString = timeDelta.toISOString();
      this.updateTimerUI(dateString.substring(11, 19));
    }
    this.timerRaf = window.requestAnimationFrame(this.startTimerInterval.bind(this));
  }

  stopTimerInterval(): void {
    window.cancelAnimationFrame(this.timerRaf);
  }

  resetTimer(): void {
    this.timerStartDate = undefined;
    this.updateTimerUI('00:00:00');
    this.stopTimerInterval();
  }

  updateTimerUI(val: any): void {
    this.timerElem.innerText = val;
  }

  renderFileName(): void {
    this.fileNameElem.innerText = "Recording to: " + this.recording.file.name;
  }


}

new FSHelpers();