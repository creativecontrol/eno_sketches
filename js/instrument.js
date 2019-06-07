$(function () {
  var config = {
      'commsType' : 'Events',
      'midiInput' : 'loopMIDI Port',
      'verbAmount': 0.0
  }
  var midiInput = null;

  var masterGain = new Tone.Gain(0.6).toMaster();
  var reverb = new Tone.Convolver(
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/hm2_000_ortf_48k.mp3'
  ).connect(masterGain);
  reverb.wet.value = config.verbAmount;

  var soundA = new Tone.Sampler({
    "A4": 'samples/VlnEns_Harm_A5.wav',
    "B3": 'samples/VlnEns_Harm_B4.wav',
    "C5": 'samples/VlnEns_Harm_C6.wav',
    "D4": 'samples/VlnEns_Harm_D5.wav',
    "G3": 'samples/VlnEns_Harm_G4.wav'
  }).connect(reverb);
  var soundB = new Tone.Sampler({
    "E2": 'samples/Vibes_soft_E3_v2_rr2_Main.wav',
    "A3": 'samples/Vibes_soft_A4_v2_rr3_Main.wav',
    "C2": 'samples/Vibes_soft_C3_v2_rr2_Main.wav'
  }).connect(reverb);

  let mix = 0.5;

  let slider = document.querySelector('#slider');
  slider.addEventListener('input', function() {
    mix = slider.value;
    console.log(mix + ' ' + Tone.gainToDb(100/mix) + ' ' + Tone.gainToDb(100/(100-mix)));
    soundA.volume.value = Tone.gainToDb(100/mix);
    soundB.volume.value = Tone.gainToDb(100/(100-mix));
  });

  function setupEventsInput () {
    document.addEventListener('noteOn', function (evt) {
        console.log(evt);
        soundA.triggerAttack(evt.detail.note);
        soundB.triggerAttack(evt.detail.note);
    });

    document.addEventListener('noteOff', function (evt) {
      console.log(evt);
      soundA.triggerRelease(evt.detail.note);
      soundB.triggerRelease(evt.detail.note);
    });
  }

    function setupMIDIInput () {
        WebMidi.enable(err => {
          if (err) {
            // using more extensive error messaging to pass back to NodeJS
            console.error('WebMidi could not be enabled', err.name, err.message);
            return;
          }
          console.log('WebMidi loaded successfully');
          console.debug(WebMidi.inputs);
          console.debug(WebMidi.outputs);

          midiInput = WebMidi.getInputByName(config.midiInput);
          console.debug(midiInput);
          midiInput.addListener('noteon', "all",
            function (event) {
              console.log(event);
              console.log("Received 'noteon' message (" + event.note.name + event.note.octave + "). ");
              soundA.triggerAttack(event.note.number);
              soundB.triggerAttack(event.note.number);
            }
          );
          midiInput.addListener('noteoff', "all",
            function (event) {
              console.log(event);
              console.log("Received 'noteoff' message (" + event.note.name + event.note.octave + "). ");
              soundA.triggerRelease(event.note.number);
              soundB.triggerRelease(event.note.number);
            }
          );
        });
    }
  console.log('loading audio samples');
  // while (!soundA.loaded && !soundB.loaded){
  //
  // }
  if (config.commsType == 'MIDI'){
    setupMIDIInput();
  } else if (config.commsType == 'Events') {
    setupEventsInput();
  }
})
