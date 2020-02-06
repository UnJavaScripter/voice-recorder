class MediaLib {
  fileHandle: any;
  recorder: any;

  private getFileHandle() {
    const handle = (window as any).chooseFileSystemEntries();
    return handle;
  }

  private getNewFileHandle() {
    const opts = {
      type: 'saveFile',
      accepts: [{
        description: 'Audio file',
        extensions: ['mp3'],
        mimeTypes: ['audio/mpeg'],
      }],
    };
    const handle = (window as any).chooseFileSystemEntries(opts);
    return handle;
  }

  async startRecording(recorder: any, maxBufferSize: number = 100, storeEachMillis: number = 1000) {
    let data: BlobPart[] = [];
    this.recorder = recorder;

    if(!this.fileHandle) {
      this.fileHandle = await this.getNewFileHandle();
    }else {
      this.fileHandle = await this.getFileHandle();
    }
    console.log(this.fileHandle.size)
    debugger
    
    this.recorder.ondataavailable = (event: any) => {
      console.log('ondataavailable', event.data)
      if(data.length >= maxBufferSize) {
        data.length = 0;
      }
      data.push(event.data)
      const recordedBlob = new Blob(data, { type: "video/webm" });
      this.writeFile(this.fileHandle, recordedBlob)
    };
    this.recorder.start(storeEachMillis);
    console.log(this.recorder.state);

    let stopped = new Promise((resolve, reject) => {
      this.recorder.onstop = resolve;
      this.recorder.onerror = (event: Event) => reject(event); //event.name
    });

    return Promise.all([
      stopped,
    ])
      .then(() => {
        console.log('recorded!!', data)
        return data
      });
  }

  private async writeFile(fileHandle: any, contents: any) {
    const writer = await fileHandle.createWriter({keepExistingData: true});
    console.log(contents)
    await writer.write(0, contents);
    console.log('will write', contents)

    await writer.close();
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
