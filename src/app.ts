const mediaLib = new MediaLib();

enum RecordingStatus {
  READY,
  RECORDING,
  PAUSED
}

class FSHelpers {
  startButton: HTMLElement;
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
    this.startButton = document.getElementById('start-btn') as HTMLElement;
    this.stopButton = document.getElementById("stop-btn") as HTMLElement;

    this.pauseButton = document.getElementById("pause-btn") as HTMLMediaElement;
    this.resumeButton = document.getElementById("resume-btn") as HTMLMediaElement;

    this.preview = document.getElementById("preview") as HTMLMediaElement;

    this.userMedia = navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      this.preview.srcObject = stream;
      this.oscilloscope = new Oscilloscope(stream, canvas);
      return stream;
    })

    this.startButton.addEventListener('click', async () =>  {
      if (this.recording.status === RecordingStatus.READY) {
        this.start().then((file) => {
          this.recording.file = file;
          this.renderFileName();
          this.startTimerInterval();
          this.recording.status = RecordingStatus.RECORDING;
        });
      } else if(this.recording.status === RecordingStatus.PAUSED) {
        mediaLib.resume();
        this.startTimerInterval();
        this.recording.status = RecordingStatus.RECORDING;
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

    this.pauseButton.addEventListener('click', () => {
      if (this.recording.status === RecordingStatus.PAUSED) {
        mediaLib.resume();
        this.startTimerInterval();
        this.recording.status = RecordingStatus.RECORDING;
      } else if(this.recording.status === RecordingStatus.RECORDING) {
        mediaLib.pause();
        this.stopTimerInterval();
        this.recording.status = RecordingStatus.PAUSED;
      }
    });
   
  }

  private async start() {
    const streamSource = await this.userMedia;
    const recorder = new MediaRecorder(streamSource);
    this.preview.captureStream(recorder);
    return await mediaLib.startRecording(
      recorder,
      this.maxBufferSize,
      this.storeEachMillis
    )
    
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
    })
  }

  renderFileName() {
    this.fileNameElem.innerText = "Recording to: " + this.recording.file.name;
  }


}

new FSHelpers();