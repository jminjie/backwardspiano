# Backwards MIDI piano
A backwards MIDI piano (keys are mirrored) with simple visual effects.

## Development
For self hosting, after cloning the repo run `npm install` to install necessary
packages.

To clone beautiful-piano run
```
cd public;
git clone https://github.com/musicjs/beautiful-piano.git
```

Deploy with `node index.js debug`. This will serve the files
needed for the page (index.html and js/) and also start the NodeJs server
(index.js).

If you have local SSL keys you can deploy with HTTPS using `node index.js`.
Note that a secure connection is required for MIDI input (localhost is secure
by default).

Client should be available at localhost:30001.

## Browser support
Chrome and Edge work. Firefox does not work as there is [no support for
MIDI](https://developer.mozilla.org/en-US/docs/Web/API/MIDIAccess). Other
browsers are not tested, but should work if they support MIDI and Tone.js.
