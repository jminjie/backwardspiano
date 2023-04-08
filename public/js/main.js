// if sound has been enabled do not show the sound permissions request overlay
window.addEventListener('load', function() {
  if (document.cookie.indexOf("cookie_soundon=") < 0) {
    document.querySelector('.sound-overlay').classList.remove('d-none');
  }
  resizeKeyboard();
});

window.addEventListener("resize", () => {
  resizeKeyboard();
});

function resizeKeyboard() {
  let s = (window.innerWidth * 0.95) / PIANO_WIDTH;
  let w = PIANO_WIDTH / (window.innerWidth * 0.95);
  console.log(PIANO_WIDTH, window.innerWidth, s, w);
  let containerNode = document.querySelector('#pianocontainer');
  containerNode.style.transform = `scaleX(${s}) scaleY(${s})`;
  containerNode.style.width = `${w * 100}%`;
  containerNode.style.left = `-${(((w * 100) - 100) / 2) - 2}%`;
  containerNode.style.display = `inline-block`;
  let reflectionNode = document.querySelector('#pianovisualreflection');

  let h = window.innerHeight;
  reflectionNode.style.padding = `0 0 ${Math.max(240, h*0.35)}px 0`;
}


var NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const LOW_A_MIDI = 21;
const HI_C_MIDI = 108;

const PIANO_WIDTH = 2080;

// pedal for both samplers
var myPedal = false;

// currently pressed keys for both samplers (used when releasing pedal)
var myPressedKeys = new Set()

// gain for both samplers
var myGain = 1.0;

Tone.context.latencyHint = "fastest";

// octave for computer keyboard entry
var octave = 0;

if (navigator.requestMIDIAccess) {
  console.log('This browser supports WebMIDI!');
  document.getElementById("browser-status").innerHTML = "browser supports MIDI";
  document.getElementById("browser-status").style.color = "green";
} else {
  console.log('WebMIDI is not supported in this browser.');
  document.getElementById("browser-status").innerHTML = "browser does not support MIDI. consider using Chrome, Edge, Firefox, or Opera";
  document.getElementById("browser-status").style.color = "red";
}

try {
  navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);
} catch (e) {
  console.log(e);
}

const default_reverb = new Tone.Reverb(1.5).toDestination();

var mySampler = new Tone.Sampler({
  urls: {
    A1: "A1.mp3",
    A2: "A2.mp3",
    A3: "A3.mp3",
    A4: "A4.mp3",
    A5: "A5.mp3",
    A6: "A6.mp3",
    A7: "A7.mp3",
  },
  release: 0.6,
  baseUrl: "https://tonejs.github.io/audio/salamander/",
}).connect(default_reverb).toDestination();

function logError(err) {
  if (!err) return;
  if (typeof err === 'string') {
    console.warn(err);
  } else {
    console.warn(err.toString(), err);
  }
}

function playMidi(command, byte1, byte2) {
  switch (command) {
    case 144: // keyDown
      if (byte2 > 0) {
        keyDown(byte1, byte2);
      } else {
        keyUp(byte1);
      }
      break;
    case 128: // keyUp
      keyUp(byte1);
      break;
    case 176: // special command
      if (byte1 == 64) { // pedal
        if (byte2 == 0) {
          pedalOff();
        } else {
          pedalOn();
        }
      }
      break;
  }
}

function keyDown(midiValue, velocity) {
  let note = getNote(midiValue);
  myPressedKeys.add(note);
  if (midiValue >= LOW_A_MIDI && midiValue <= HI_C_MIDI) {
    document.querySelectorAll('.' + getNoteFlipped(midiValue).replace('#', 's'))
      .forEach((a) => {a.classList.add('active')});
  }
  mySampler.triggerAttack(note, Tone.context.currentTime, velocity*myGain/120)
  document.querySelector('#toneplayeddebug').innerHTML = note;
}

function keyUp(midiValue) {
  let note = getNote(midiValue);
  myPressedKeys.delete(note)
  if (midiValue >= LOW_A_MIDI && midiValue <= HI_C_MIDI) {
    document.querySelectorAll('.' + getNoteFlipped(midiValue).replace('#', 's'))
      .forEach((a) => {a.classList.remove('active')});
  }
  if (!myPedal) {
    mySampler.triggerRelease(note, Tone.context.currentTime)
  }
}

function getNote(midiValue) {
  //let noteLetter = NOTES[midiValue%12];
  //let octave = Math.floor(midiValue/12)-1;
  //return noteLetter + octave;
  let flippedMidiValue = 128 - midiValue - 4;
  let noteLetter = NOTES[flippedMidiValue%12];
  let octave = Math.floor(flippedMidiValue/12)-1;
  return noteLetter + octave;
}

function getNoteFlipped(midiValue) {
  let noteLetter = NOTES[midiValue%12];
  let octave = Math.floor(midiValue/12)-1;
  return noteLetter + octave;
}

function onMIDIFailure() {
  console.log('Could not access your MIDI devices.');
}

function onMIDISuccess(midiAccess) {
  console.log(midiAccess);

  var inputs = midiAccess.inputs;
  var outputs = midiAccess.outputs;
  var deviceInfoMessage = "List of devices: [";
  for (var input of midiAccess.inputs.values()) {
    deviceInfoMessage += input.name + ", ";
    input.onmidimessage = onMidiMessage;
  }
  deviceInfoMessage += "]";
  if (inputs.size > 0) {
    document.getElementById("midi-status").innerHTML = deviceInfoMessage;
    document.getElementById("midi-status").style.color = "green";
  }
}

document.addEventListener('keydown', function(event) {
  if (event.repeat == true) {
    return;
  }
  if (event.srcElement.localName == "input") {
    return;
  }
  let midiKeyCode = -1;
  switch (event.code) {
    case "KeyA":
      midiKeyCode = 60;
      break;
    case "KeyW":
      midiKeyCode = 61;
      break;
    case "KeyS":
      midiKeyCode = 62;
      break;
    case "KeyE":
      midiKeyCode = 63;
      break;
    case "KeyD":
      midiKeyCode = 64;
      break;
    case "KeyF":
      midiKeyCode = 65;
      break;
    case "KeyT":
      midiKeyCode = 66;
      break;
    case "KeyG":
      midiKeyCode = 67;
      break;
    case "KeyY":
      midiKeyCode = 68;
      break;
    case "KeyH":
      midiKeyCode = 69;
      break;
    case "KeyU":
      midiKeyCode = 70;
      break;
    case "KeyJ":
      midiKeyCode = 71;
      break;
    case "KeyK":
      midiKeyCode = 72;
      break;
    case "KeyZ":
      octave--;
      break;
    case "KeyX":
      octave++;
      break;
  }
  if (midiKeyCode != -1) {
    midiKeyCode += octave*12;
    playMidi(144, midiKeyCode, 80);
  }
});

document.addEventListener('keyup', function(event) {
  if (event.repeat == true) {
    return;
  }
  if (event.srcElement.localName == "input") {
    return;
  }
  let midiKeyCode = -1;
  switch (event.code) {
    case "KeyA":
      midiKeyCode = 60;
      break;
    case "KeyW":
      midiKeyCode = 61;
      break;
    case "KeyS":
      midiKeyCode = 62;
      break;
    case "KeyE":
      midiKeyCode = 63;
      break;
    case "KeyD":
      midiKeyCode = 64;
      break;
    case "KeyF":
      midiKeyCode = 65;
      break;
    case "KeyT":
      midiKeyCode = 66;
      break;
    case "KeyG":
      midiKeyCode = 67;
      break;
    case "KeyY":
      midiKeyCode = 68;
      break;
    case "KeyH":
      midiKeyCode = 69;
      break;
    case "KeyU":
      midiKeyCode = 70;
      break;
    case "KeyJ":
      midiKeyCode = 71;
      break;
    case "KeyK":
      midiKeyCode = 72;
      break;
  }
  if (midiKeyCode != -1) {
    midiKeyCode += octave*12;
    playMidi(128, midiKeyCode, 0);
  }
});

function onMidiMessage(message) {
  var command = message.data[0];
  var byte1 = message.data[1];
  // a velocity value might not be included with a noteOff command
  var byte2 = (message.data.length > 2) ? message.data[2] : 0;

  playMidi(command, byte1, byte2)
}

function pedalOff() {
  myPedal = false;
  let releaseKeys = getAllKeysWhichArentPressed();
  mySampler.triggerRelease(releaseKeys, Tone.context.currentTime)
}

function pedalOn() {
  myPedal = true;
}

var ALL_KEYS = []
// A1 to C8
for (let i = 21; i < 108; i++) {
  ALL_KEYS.push(getNote(i));
}

function getAllKeysWhichArentPressed() {
  let toReturn = [];
  for (let i = 0; i < ALL_KEYS.length; i++) {
    if (!myPressedKeys.has(ALL_KEYS[i])) {
      toReturn.push(ALL_KEYS[i]);
    }
  }
  return toReturn;
}

function toggleVisual() {
  if (paused) {
    space.resume();
    paused = false;
  } else {
    paused = true;
    space.pause();
  }
}

function acceptSound() {
  document.cookie = "cookie_soundon=true";
  document.querySelector('.sound-overlay').classList.add('d-none');
  Tone.start();
}

var diagnosticsOpen = false;
function toggleDiagnostics() {
  if (diagnosticsOpen) {
    diagnosticsOpen = false;
    document.querySelector('.diagnostics').classList.add('d-none');
  } else {
    diagnosticsOpen = true;
    document.querySelector('.diagnostics').classList.remove('d-none');
  }
}

piano(document.querySelector('#pianovisual'), {range: {
    startKey: 'A',
    startOctave: 0,
    endKey: 'C',
    endOctave: 8
}});

piano(document.querySelector('#pianovisualreflection'), {range: {
    startKey: 'A',
    startOctave: 0,
    endKey: 'C',
    endOctave: 8
}});

