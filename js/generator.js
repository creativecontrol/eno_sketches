$(function () {

  var config = {
      'commsType' : 'Events',
      'midiOutput' : 'loopMIDI Port',
      'midiChannel' : 1,
      'tempo' : 120
  }
  var midiOutput = null;

  function setupMIDIOutput (outputDevice) {
    WebMidi.enable(err => {
      if (err) {
        // using more extensive error messaging to pass back to NodeJS
        console.error('WebMidi could not be enabled', err.name, err.message);
        return;
      }
      console.log('WebMidi loaded successfully');

      console.debug(WebMidi.inputs);
      console.debug(WebMidi.outputs);

      midiOutput = WebMidi.getOutputByName(config.midiOutput);
    });
  }

  let seq = [
        {"time" : "0:0", "note" : "C3", "velocity": 0.9},
        {"time" : "0:2", "note" : "C#3", "velocity": 0.5},
        {"time" : "0:3", "note" : "D3", "velocity": 0.5},
        {"time" : "1:2", "note" : "D#3", "velocity": 0.5},
        {"time" : "1:3", "note" : "E3", "velocity": 0.5},
        {"time" : "2:1", "note" : "F3", "velocity": 0.5},
        {"time" : "2:2", "note" : "F#3", "velocity": 0.5}
      ];

  let part = new Tone.Part(function(time, event){
    //the events will be given to the callback with the time they occur
    // soundA.triggerAttackRelease(event.note, event.dur, time);
    // soundB.triggerAttackRelease(event.note, event.dur, time);
    console.debug(event);
    console.debug('sending MIDI ' + event.note + ' ' + event.dur + ' ' + event.velocity);
    midiOutput.playNote(event.note, config.midiChannel, {duration: 500, velocity: 1});
    // .stopNote(event.note, config.midiChannel, {time: event.dur});
  }, [
    {'time': '0:0', 'note': 'C1', 'velocity': 0.0}
  ]);

  function eventNote (note, channel, params) {
    var time;
    params = params || {};
    let noteOn = new CustomEvent(
      "noteOn",
      {
        detail: {
        note: note,
        channel: channel,
        velocity: params.velocity
      }
    });
    let noteOff = new CustomEvent(
      "noteOff",
      {
        detail:{
        note: note,
        channel: channel,
        velocity: 0
      }
    });

    console.log("dispatching noteOn");
    document.dispatchEvent(noteOn);

    if(!isNaN(params.duration)) {
      if (params.duration <= 0) { params.duration = 0; }
      Tone.Transport.schedule(document.dispatchEvent(noteOff), `${params.duration}`);
    }
  }

  function phasing () {
    [{note: 'F3',  dur: 1.015},
      {note: 'G#3', dur: 0.95},
      {note: 'C4',  dur: 1.01},
      {note: 'C#4', dur: 1.1},
      {note: 'F4',  dur: 1.04},
      {note: 'G#4', dur: 1.02}].forEach(({note, dur}, i) => {
        const startAtTime = i / 2;
        Tone.Transport.schedule(function play(time) {
          if (config.commsType == 'MIDI') {
            midiOutput.playNote(note, config.midiChannel, {duration: 500, velocity: 0.5});
          } else if ( config.commsType == 'Events') {
            eventNote(note, config.midiChannel, {duration: 500, velocity: 0.5});
          }
          // players[note].start(time);
          Tone.Transport.schedule(play, `+${dur}`);
        }, startAtTime);
      });
  }

  function startTransport () {
    Tone.Transport.bpm.value = config.tempo;
    Tone.Transport.loop = true;
  	Tone.Transport.loopStart = 0;
  	Tone.Transport.loopEnd = "8m";
    Tone.Transport.start();
    console.log('transport started');

    Tone.Transport.scheduleRepeat(function(time){
      //do something with the time
      console.log(Tone.Transport.position);
    }, "1m");
  }

  function beginPart () {
    console.log('starting part');
    part.loop = 3;
    part.loopEnd = '1m';
    part.start();
  }

  let trigger = document.querySelector('#tone-play-toggle');
  trigger.addEventListener('click', function() {
    console.log("trying to update part");
    part.removeAll();
    for (var i = 0; i < seq.length; i++) {
        part.add(seq[i]);
    }
    part.start();
    part.loop = false;
    console.log(part);
    console.log(part.state);

  })

  if (config.commsType == 'MIDI'){
    setupMIDIOutput();
  }
  startTransport();
  phasing();
  // beginPart();

  StartAudioContext(Tone.context, document.documentElement);
})
