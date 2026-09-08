export const tracks = [
  { id: 'afternoon', title: 'Afternoon at home', detail: 'Soft, unhurried piano', chords: [[60,64,67,71],[57,60,64,67],[53,57,60,64],[55,59,62,67]], pace: .72 },
  { id: 'rain', title: 'Rain on the windows', detail: 'A little rain, a little piano', chords: [[62,65,69,72],[58,62,65,69],[60,64,67,71],[57,60,64,67]], pace: .92 },
  { id: 'night', title: 'After the last light', detail: 'A warm evening lullaby', chords: [[57,60,64,71],[53,57,60,67],[55,59,62,69],[52,55,59,64]], pace: 1.12 },
] as const;
export type TrackId = typeof tracks[number]['id'];

// Original synthesized room ambience; no remote recordings or autoplay.
export class RoomAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private rain: AudioBufferSourceNode | null = null;
  private active: OscillatorNode[] = [];
  private generation = 0;
  async play(id: TrackId, volume = .35) {
    const generation = ++this.generation;
    this.stopNodes();
    this.context ??= new AudioContext();
    await this.context.resume();
    if (generation !== this.generation) return;
    const context = this.context;
    this.master = context.createGain(); this.master.gain.value = volume * .24; this.master.connect(context.destination);
    const track = tracks.find(t => t.id === id)!;
    let next = context.currentTime + .04, step = 0;
    const schedule = () => {
      if (!this.master) return;
      while (next < context.currentTime + .3) {
        const chord = track.chords[Math.floor(step / 8) % track.chords.length];
        const note = chord[[0,2,1,3,2,1,3,1][step % 8]] + (step % 8 > 3 ? 12 : 0);
        const osc = context.createOscillator(), gain = context.createGain();
        osc.type = 'sine'; osc.frequency.value = 440 * 2 ** ((note - 69) / 12);
        gain.gain.setValueAtTime(0, next); gain.gain.linearRampToValueAtTime(.44, next + .012); gain.gain.exponentialRampToValueAtTime(.001, next + 2.8);
        osc.connect(gain); gain.connect(this.master); osc.start(next); osc.stop(next + 2.9); this.active.push(osc);
        osc.onended = () => { osc.disconnect(); gain.disconnect(); this.active = this.active.filter(o => o !== osc); };
        next += track.pace; step++;
      }
    };
    if (id === 'rain') {
      const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate); const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * .16;
      const rain = context.createBufferSource(), filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 700;
      rain.buffer = buffer; rain.loop = true; rain.connect(filter); filter.connect(this.master); rain.start(); this.rain = rain;
    }
    schedule(); this.timer = setInterval(schedule, 120);
  }
  volume(value: number) { if (this.master && this.context) this.master.gain.setTargetAtTime(value * .24, this.context.currentTime, .05); }
  private stopNodes() {
    if (this.timer) clearInterval(this.timer); this.timer = null;
    this.rain?.stop(); this.rain?.disconnect(); this.rain = null;
    this.active.forEach(o => { try { o.stop(); } catch { /* Already ended. */ } }); this.active = [];
    this.master?.disconnect(); this.master = null;
  }
  stop() { this.generation++; this.stopNodes(); }
  dispose() { this.stop(); if (this.context) void this.context.close(); this.context = null; }
}
