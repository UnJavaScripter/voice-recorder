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
  userMedia: any;
  recording: any;

  maxBufferSize: number = 100;
  storeEachMillis: number = 1000;

  constructor() {
    this.recording = {
      status: RecordingStatus.READY
    }
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
      } else {
        mediaLib.pause();
        this.recording.status = RecordingStatus.PAUSED;
      }
    });
    
  }

  private start() {
    this.userMedia.then((stream: any) => {
      const recorder = new MediaRecorder(stream)
      this.preview.captureStream(recorder);
      mediaLib.startRecording(
        recorder,
        this.maxBufferSize,
        this.storeEachMillis
      )
    })
  }


}

new FSHelpers();