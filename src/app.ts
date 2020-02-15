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
  fileNameElem: HTMLMediaElement | any;
  userMedia: any;
  recording: any;
  timer: any;
  timerDate: Date;

  maxBufferSize: number = 100;
  storeEachMillis: number = 1000;

  oscilloscope: any;

  constructor() {
    const canvas: HTMLCanvasElement | null = document.getElementById('oscilloscope') as HTMLCanvasElement;
    this.recording = {
      status: RecordingStatus.READY,
      currentTime: 0
    }
    this.timerDate = new Date(0);
    
    this.timerElem = document.getElementById('timer') as HTMLElement;
    this.fileNameElem = document.getElementById('file-name') as HTMLElement;
    this.recordButton = document.getElementById('start-btn') as HTMLButtonElement;
    this.stopButton = document.getElementById("stop-btn") as HTMLButtonElement;

    this.resumeButton = document.getElementById("resume-btn") as HTMLButtonElement;

    this.preview = document.getElementById("preview") as HTMLMediaElement;

    this.init(canvas);
  }

  init(canvas: HTMLCanvasElement) {
    this.setUIState(RecordingStatus.READY);
    this.userMedia = navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      this.preview.srcObject = stream;
      this.oscilloscope = new Oscilloscope(stream, canvas);
      return stream;
    })

    this.recordButton.addEventListener('click', async () =>  {
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
      } else if(this.recording.status === RecordingStatus.PAUSED) {
        mediaLib.resume();
        this.startTimerInterval();
        this.recording.status = RecordingStatus.RECORDING;
        this.setUIState(RecordingStatus.RECORDING);
      } else if(this.recording.status === RecordingStatus.RECORDING) {
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
      } else if (this.recording.status === RecordingStatus.PAUSED) {
        mediaLib.resume();
        mediaLib.stop();
        this.resetTimer();
        this.recording.status = RecordingStatus.READY;
      }
    });

  }

  private setUIState(recordingStatus: RecordingStatus) {
    const setButtonIcon = (element: HTMLElement, iconName: string): void => {
      if(element.firstElementChild) {
        element.firstElementChild.innerHTML = iconName;
      }
    }
    switch(recordingStatus) {
      case(RecordingStatus.READY): {
        this.stopButton.setAttribute('disabled', 'disabled');
        setButtonIcon(this.recordButton, 'fiber_manual_record');
        break;
      }
      case(RecordingStatus.RECORDING): {
        this.stopButton.removeAttribute('disabled');
        setButtonIcon(this.recordButton, 'pause');
        break;
      }
      case(RecordingStatus.PAUSED): {
        this.stopButton.removeAttribute('disabled');
        setButtonIcon(this.recordButton, 'fiber_manual_record');
        break;
      }
    }
  }

  private async startRecording() {
    const streamSource = await this.userMedia;
    const recorder = new MediaRecorder(streamSource);
    this.preview.captureStream(recorder);

    return await mediaLib.startRecording(
      recorder,
      this.maxBufferSize,
      this.storeEachMillis
    );
    
  }

  tick() {
    this.recording.currentTime += 1;
    this.updateTimerUI(this.recording.currentTime);
  }

  startTimerInterval() {
    this.timer = setInterval(() => {
      console.log('tick', this.recording.currentTime)
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

  updateTimerUI(val: number) {
    requestAnimationFrame(() => { // todo: cancel it!
      this.timerDate.setSeconds(val);
      this.timerElem.innerText = new Date(1000 * val).toISOString().substr(11, 8);
    });
  }

  renderFileName() {
    this.fileNameElem.innerText = "Recording to: " + this.recording.file.name;
  }


}

new FSHelpers();