/* A Synthesizer that uses multiple samples to allow morphing of parameters similar to MI Rings.
This will be based on the mapping of the nSynth JS demo
*/
$(function(){

  let masterGain = new Tone.Gain(0.6).toMaster();
  let reverb = new Tone.Convolver(
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/hm2_000_ortf_48k.mp3'
  ).connect(masterGain);
  reverb.wet.value = 0.2;

  let soundA = new Tone.Sampler({
    A5: 'samples/VlnEns_Harm_A5.wav',
    B4: 'samples/VlnEns_Harm_B4.wav',
    C6: 'samples/VlnEns_Harm_C6.wav',
    D5: 'samples/VlnEns_Harm_D5.wav',
    G4: 'samples/VlnEns_Harm_G4.wav'
  }).connect(reverb);
  let soundB = new Tone.Sampler({
    E3: 'samples/Vibes_soft_E3_v2_rr2_Main.wav',
    A4: 'samples/Vibes_soft_A4_v2_rr3_Main.wav',
    C3: 'samples/Vibes_soft_C3_v2_rr2_Main.wav'
  }).connect(reverb);

  let mix = 0.5;

  let seq = [
        {"time" : "0:0", "note" : "C3", "velocity": 0.9},
        {"time" : "0:2", "note" : "C#3", "velocity": 0.5},
        {"time" : "0:3", "note" : "D3", "velocity": 0.5},
        {"time" : "1:2", "note" : "D#3", "velocity": 0.5},
        {"time" : "1:3", "note" : "E3", "velocity": 0.5},
        {"time" : "2:1", "note" : "F3", "velocity": 0.5},
        {"time" : "2:2", "note" : "F#3", "velocity": 0.5}
      ];
  // let seq = [{ time : 0, note : 'C4', dur : '2n'},
  // { time : {'4n' : 1, '8n' : 1}, note : 'E4', dur : '4n'},
  // { time : '2n', note : 'G4', dur : '8n'},
  // { time : {'2n' : 1, '8t' : 1}, note : 'B4', dur : '2n'}];
  //pass in an array of events
  let part = new Tone.Part(function(time, event){
    //the events will be given to the callback with the time they occur
    soundA.triggerAttackRelease(event.note, event.dur, time);
    soundB.triggerAttackRelease(event.note, event.dur, time);
  }, [
    {'time': '0:0', 'note': 'C1', 'velocity': 0.0}
  ]);
  // part.add(seq);
  //start the part at the beginning of the Transport's timeline
  part.start();

  //loop the part 8 times
  part.loop = 3;
  part.loopEnd = '1m';


	Tone.Transport.loop = true;
	Tone.Transport.loopStart = 0;
	Tone.Transport.loopEnd = "8m";

  Tone.Transport.scheduleRepeat(function(time){
  //do something with the time
  console.log(Tone.Transport.position);
}, "1m");

  Tone.Transport.start();

  Tone.Transport.bpm.value = 148;

  let stopPart = function () {
    part.removeAll();
  }

  let trigger = document.querySelector('#tone-play-toggle');
  trigger.addEventListener('click', function() {
    console.log("trying to start part");
    console.log();
    // Tone.Transport.stop();
    // part.stop();
    part.removeAll();
    for (var i = 0; i < seq.length; i++) {
        part.add(seq[i]);
      }
    // part.startOffset = Tone.Time(Tone.Transport.position).toSeconds() + 2;
    part.start();
    console.log(part);
    console.log(part.state);
    part.loop = false;
    // part.loopEnd = '+1m'
    // Tone.Transport.start();

  })

  let slider = document.querySelector('#slider');
  slider.addEventListener('input', function() {
    mix = slider.value;
    console.log(mix + ' ' + Tone.gainToDb(100/mix) + ' ' + Tone.gainToDb(100/(100-mix)));
    soundA.volume.value = Tone.gainToDb(100/mix);
    soundB.volume.value = Tone.gainToDb(100/(100-mix));
  })

  StartAudioContext(Tone.context, document.documentElement);

})
// class Sound {
//   constructor(){
//     this._sources = [];
//     this._damping = 0.5; // damping allows for movement between a "dry" to "wet" sound
//     this._structure = 0.5; // structure allows for fading between less and more inharmonic sounds
//   }

//   set structure(val) {
//     this._structure = val;

//     const floor = Math.floor(val * Config.interpolationCount);
//     const ceil = Math.ceil(val * Config.interpolationCount);

//     if (floor !== ceil) {
//       const dist = val * Config.interpolationCount - floor;
//       this._sources[floor].volume = 1-dist;
//       this._sources[ceil].volume = dist;
//     } else {
//       this._sources[ceil].volume = 1;
//     }

//     this._sources.forEach((src, i) => {
//       if (i !== ceil && i !== floor) {
//         src.volume = 0;
//       }
//     })
//   }

//   noteOn(midi, time) {
//     if (this.loaded) {
//       const note = Tone.Frequency(midi, 'midi').toNote();
//       this._sources.forEach(source => source.noteOn(note, time));
//     }
//   }
//   noteOff(midi, time) {
//     if (this.loaded) {
//       const note = Tone.Frequency(midi, 'midi').toNote();
//       this._sources.forEach(source => source.noteOff(note, time));
//     }
//   }

//   get loaded() {
//     let isLoaded = true;
//     this._sources.ForEach(source => isLoaded = source.loaded && isLoaded);
//     return isLoaded;
//   }
// }

// class Source () {
//   constructor (folder, mixA) {

//   }
// }
