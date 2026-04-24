export class AudioStreamer {
  private context: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private isRecording = false;

  constructor(private onAudioData: (base64Data: string) => void) {}

  async start() {
    if (this.isRecording) return;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        },
      });
      this.context = new AudioContext({ sampleRate: 16000 });
      await this.context.audioWorklet.addModule(
        URL.createObjectURL(
          new Blob(
            [
              `
              class RecorderWorklet extends AudioWorkletProcessor {
                process(inputs, outputs, parameters) {
                  const input = inputs[0];
                  if (input.length > 0) {
                    const channelData = input[0];
                    this.port.postMessage(channelData);
                  }
                  return true;
                }
              }
              registerProcessor('recorder-worklet', RecorderWorklet);
            `,
            ],
            { type: 'application/javascript' }
          )
        )
      );

      this.source = this.context.createMediaStreamSource(this.stream);
      this.workletNode = new AudioWorkletNode(this.context, 'recorder-worklet');

      this.workletNode.port.onmessage = (e) => {
        const float32Array = e.data as Float32Array;
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
          const s = Math.max(-1, Math.min(1, float32Array[i]));
          int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        const buffer = new Uint8Array(int16Array.buffer);
        let binary = '';
        for (let i = 0; i < buffer.byteLength; i++) {
          binary += String.fromCharCode(buffer[i]);
        }
        const base64 = btoa(binary);
        this.onAudioData(base64);
      };

      this.source.connect(this.workletNode);
      this.workletNode.connect(this.context.destination);
      this.isRecording = true;
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw error;
    }
  }

  stop() {
    if (!this.isRecording) return;
    this.isRecording = false;
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.context) {
      this.context.close();
      this.context = null;
    }
  }
}

export class AudioPlayer {
  private context: AudioContext | null = null;
  private nextTime = 0;

  init() {
    if (!this.context) {
      this.context = new AudioContext({ sampleRate: 24000 });
      this.nextTime = this.context.currentTime;
    }
  }

  playBase64(base64: string) {
    this.init();
    if (!this.context) return;

    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const buffer = this.context.createBuffer(1, float32Array.length, 24000);
    buffer.getChannelData(0).set(float32Array);

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);

    if (this.nextTime < this.context.currentTime) {
      this.nextTime = this.context.currentTime;
    }
    source.start(this.nextTime);
    this.nextTime += buffer.duration;
  }

  stop() {
    if (this.context) {
      this.context.close();
      this.context = null;
    }
    this.nextTime = 0;
  }
}
