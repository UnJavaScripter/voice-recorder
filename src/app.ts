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
  userMedia: any;
  recording: any;
  timer: any;

  maxBufferSize: number = 100;
  storeEachMillis: number = 1000;

  constructor() {
    this.recording = {
      status: RecordingStatus.READY,
      currentTime: 0
    }
    this.timerElem = document.getElementById('timer') as HTMLElement;
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
      return stream;
    })

    this.startButton.addEventListener('click', async () =>  {
      if (this.recording.status === RecordingStatus.READY) {
        this.start().then(() => {
          this.startTimer();
          this.recording.status = RecordingStatus.RECORDING;
        });
      } else if(this.recording.status === RecordingStatus.PAUSED) {
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
        this.startTimer();
        this.recording.status = RecordingStatus.RECORDING;
      } else if(this.recording.status === RecordingStatus.RECORDING) {
        mediaLib.pause();
        this.stopTimer();
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
    this.timerElem.innerText = this.recording.currentTime;
  }

  startTimer() {
    this.timer = setInterval(() => {
      console.log('tick', this.recording.currentTime)
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