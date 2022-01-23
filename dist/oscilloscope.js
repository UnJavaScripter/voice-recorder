"use strict";
// Based on https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createAnalyser
class Oscilloscope {
    constructor(stream, canvasElem) {
        this.canvasElem = canvasElem;
        this.canvasCtx = canvasElem.getContext('2d');
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        this.analyser = audioCtx.createAnalyser();
        this.analyser.fftSize = 2048;
        this.width = this.canvasElem.width;
        this.height = this.canvasElem.height;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        source.connect(this.analyser);
        this.start();
    }
    draw(canvasCtx) {
        this.oscilloscopeRAF = requestAnimationFrame(() => this.draw(canvasCtx));
        this.analyser.getByteTimeDomainData(this.dataArray);
        canvasCtx.clearRect(0, 0, this.width, this.height);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = '#d99c9cde';
        canvasCtx.beginPath();
        var sliceWidth = this.width * 1.0 / this.bufferLength;
        var x = 0;
        for (var i = 0; i < this.bufferLength; i++) {
            var v = this.dataArray[i] / 128.0;
            var y = v * this.height / 2;
            if (i === 0) {
                canvasCtx.moveTo(x, y);
            }
            else {
                canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        canvasCtx.lineTo(this.width, this.height / 2);
        canvasCtx.stroke();
        this.drawContainer(canvasCtx);
    }
    drawContainer(canvasCtx) {
        canvasCtx.beginPath();
        var gradient = canvasCtx.createRadialGradient(this.width / 2, this.width / 2, Math.PI * 2, this.width / 2, this.width / 2, this.width / 2);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.7, '#500a0a');
        gradient.addColorStop(1, '#2d1212');
        canvasCtx.fillStyle = gradient;
        canvasCtx.arc(this.width / 2, this.height / 2, this.height / 2, 0, Math.PI * 2);
        canvasCtx.fill();
    }
    start() {
        if (this.canvasCtx) {
            this.draw(this.canvasCtx);
        }
    }
    stop() {
        if (this.canvasCtx) {
            this.canvasCtx.clearRect(0, 0, this.width, this.height);
            cancelAnimationFrame(this.oscilloscopeRAF);
        }
    }
}
