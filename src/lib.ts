class MediaLib {
  fileHandle: any;
  recorder: any;

  private getNewFileHandle() {
    const opts = {
      type: 'save-file',
      accepts: [{
        description: 'Video file',
        extensions: ['mp4'],
        mimeTypes: ['video/mp4'],
      }],
    };
    const handle = (window as any).chooseFileSystemEntries(opts);
    
    return handle;
  }

  async startRecording(recorder: any, maxBufferSize: number = 100, storeEachMillis: number = 1000) : Promise<any> {
    let data: BlobPart[] = [];
    this.recorder = recorder;
    
    try {
      this.fileHandle = await this.getNewFileHandle();
    }catch(err) {
      // console.log('err', err)
      return Promise.reject(err);
    }

    // console.log(this.fileHandle.size)


    this.recorder.ondataavailable = (event: any) => {
      // console.log('ondataavailable', event.data)
      if (data.length >= maxBufferSize) {
        data.length = 0;
      }
      data.push(event.data)
      const recordedBlob = new Blob(data, { type: "video/webm" });
      this.writeFile(this.fileHandle, recordedBlob)
    };
    this.recorder.start(storeEachMillis);
    // console.log(this.recorder.state);

    return this.fileHandle.getFile();
  }

  private async writeFile(fileHandle: any, contents: any) {
    const writer = await fileHandle.createWriter({ keepExistingData: true });
    // console.log(contents)
    await writer.write(0, contents);
    // console.log('will write', contents)

    await writer.close();

    let stopped = new Promise((resolve, reject) => {
      this.recorder.onstop = resolve;
      this.recorder.onerror = (event: Event) => reject(event); //event.name
    });

    return Promise.all([
      stopped,
    ])
      .then(() => {
        // console.log('%c==============================================', 'color: darkslategray; background-color: yellow')
        // console.log('recorded!!', contents)
        return contents
      });
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
