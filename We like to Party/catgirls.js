"use strict";

const fs = require("fs");

const INPUT = "ExpertStandard.dat";
const OUTPUT = "EasyStandard.dat";

let difficulty = JSON.parse(fs.readFileSync(INPUT));

//#region this just counts how many time you ran it for fun, feel free to remove.
if (!fs.existsSync("count.txt")) {
  fs.writeFileSync("count.txt", parseInt("0").toString());
}
let count = parseInt(fs.readFileSync("count.txt"));
count++;
fs.writeFileSync("count.txt", count.toString());
console.log("GIVE IT UP FOR RUN " + count);
//#endregion



//    -  -  -  -  -  -  -  -  -  -  -  -  -  LOOK BELOW FOR GREEN TEXT WITH A LINE LIKE THIS. READ ALL OF THESE BEFORE USING!  -  -  -  -  -  -  -  -  -  -  -  -  -  





difficulty._customData = { _pointDefinitions: [], _customEvents: [] };

const _customData = difficulty._customData;
const _obstacles = difficulty._obstacles;
const _notes = difficulty._notes;
const _customEvents = _customData._customEvents;
const _pointDefinitions = _customData._pointDefinitions;

let filterednotes;

_obstacles.forEach(wall => {
  if (!wall._customData) {
    wall._customData = {};
  }
});

_notes.forEach(note => {
  if (!note._customData) {
    note._customData = {};
  }
});



//#region helper functions -  -  -  -  -  -  -  -  -  -  -  -  -   These make life a LOT eassier, look through, figure out what they do, add your own, have fun :)  --- many are very specific use cases and might need to be modified depnding on use.

function getJumps(njs, offset) {
  const _startHalfJumpDurationInBeats = 4;
  const _maxHalfJumpDistance = 18;
  const _startBPM = 120; //INSERT BPM HERE -  -  -  -  -  -  -  -  -  -  -  -  -  
  const bpm = 120; //AND HERE -  -  -  -  -  -  -  -  -  -  -  -  -  
  const _startNoteJumpMovementSpeed = 69; //NJS -  -  -  -  -  -  -  -  -  -  -  -  -  
  const _noteJumpStartBeatOffset = 0; //OFFSET -  -  -  -  -  -  -  -  -  -  -  -  -  

  let _noteJumpMovementSpeed = (_startNoteJumpMovementSpeed * bpm) / _startBPM;
  let num = 60 / bpm;
  let num2 = _startHalfJumpDurationInBeats;
  while (_noteJumpMovementSpeed * num * num2 > _maxHalfJumpDistance) {
    num2 /= 2;
  }
  num2 += _noteJumpStartBeatOffset;
  if (num2 < 1) {
    num2 = 1;
  }
  const _jumpDuration = num * num2 * 2;
  const _jumpDistance = _noteJumpMovementSpeed * _jumpDuration;
  return { half: num2, dist: _jumpDistance };
}

function noteScale(startBeat, endBeat, track, interval, duration, magnitude) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _scale: [
          [magnitude, magnitude, magnitude, 0, "easeOutExpo"],
          [1, 1, 1, 0.9, "easeOutBack"]
        ]
      }
    });
  }
}

function ohno(startBeat, track) {
  _pointDefinitions.push({
    _name:"ohnoTime",
    _points:[
      [0.44,0],
      [0.4, 0.3,"easeOutCubic"],
      [1,1]
    ]
  })
  filterednotes = _notes.filter(n => n._time > startBeat && n._time < startBeat+2);
  filterednotes.forEach(note => {
    note._customData._disableNoteGravity = true;
    note._customData._noteJumpMovementSpeed = 17;
});
  trackOnNotesBetween(track, startBeat, startBeat+2, 6);
  _customEvents.push({
    _time: 0,
    _type: "AnimateTrack",
    _data: {
      _duration:1,
      _track:track,
      _dissolve: [[0, 0]],
      _dissolveArrow: [[0, 0]]
    }
  }, {
    _time: startBeat-4,
    _type: "AnimateTrack",
    _data: {
      _duration: 1,
      _track:track,
      _dissolve: [[0, 0], [1, 0.5]],
      _dissolveArrow: [[0, 0], [1, 1]]
    }
  }, {
    _time: startBeat-4,
    _type: "AnimateTrack",
    _data: {
      _time:"ohnoTime",
      _duration:10,
      _track:track,
    }
  });
}

function arrowFlash(startBeat, endBeat, track, interval, duration) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _dissolveArrow: [[0, 0.499], [1, 0.5], [1, 1]]
      }
    });
  }
}

function bloqFlash(startBeat, endBeat, track, interval, duration) {
  for (let i = 0; i < endBeat - startBeat; i += interval) {
    let currentBeat = startBeat + i;
    _customEvents.push({
      _time: currentBeat,
      _type: "AnimateTrack",
      _data: {
        _track: track,
        _duration: duration,
        _dissolve: [[0, 0.499], [1, 0.5], [1, 1]]
      }
    });
  }
}

function stackHide(stackTime, revealTime) {
  let dot;
  let arrow;
  _notes
    .filter(o => o._time == stackTime)
    .forEach(o => {
      if (o._cutDirection == 8) {
        dot = o;
      } else {
        arrow = o;
      }
    });
  dot._time += 0.05;
  dot._customData._track = `stackThing${dot._time}`;
  let offset = [0, 0];
  StackWalls(revealTime, -get_note_direction(arrow));
  switch (arrow._cutDirection) {
    case 0:
      offset = [0, -1];
      break;
    case 1:
      offset = [0, 1];
      break;
    case 2:
      offset = [-1, 0];
      break;
    case 3:
      offset = [1, 0];
      break;
    case 4:
      offset = [1, -1];
      break;
    case 5:
      offset = [-1, -1];
      break;
    case 6:
      offset = [1, 1];
      break;
    case 7:
      offset = [-1, 1];
      break;
    default:
      break;
  }
  _customEvents.push(
    {
      _time: 0,
      _type: "AnimateTrack",
      _data: {
        _position: [[offset[0], offset[1], 0, 0]],
        _track: `stackThing${dot._time}`,
        _dissolve: [[0, 0]],
        _dissolveArrow: [[0, 0]]
      }
    },
    {
      _time: revealTime,
      _type: "AnimateTrack",
      _data: {
        _position: [
          [offset[0], offset[1], 0, 0],
          [0, 0, 0, 1, "easeOutElastic"]
        ],
        _scale: [
          [0.25, 0.25, 1, 0],
          [1.5, 1.5, 1, 0.5],
          [1, 1, 1, 1, "easeOutElastic"]
        ],
        _track: `stackThing${dot._time}`,
        _dissolve: [[1, 0]],
        _dissolveArrow: [[1, 0]],
        _duration: 1
      }
    }
  );
}

function genCircle(radius, n) {
  let pointss = [];
  for (let i = 0; i < n; i++) {
    pointss.push([
      radius * Math.cos(((2 * Math.PI) / n) * i) - 0.5,
      radius * Math.sin(((2 * Math.PI) / n) * i) * 1.16 - 1.6
    ]);
  }
  return pointss;
}
function genCircleNoCorrection(radius, n) {
  let pointss = [];

  for (let i = 0; i < n; i++) {
    pointss.push([
      radius * Math.cos(((2 * Math.PI) / n) * i),
      radius * Math.sin(((2 * Math.PI) / n) * i)
    ]);
  }
  return pointss;
}

function round(value, decimals) {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
}

function DecayShakePath(xAmp, yAmp, zAmp, points, easing = "easeStep") {
  let step = 1 / points;
  let tog = false;
  let WOWTHISISANAME = [[0, 0, 0, 0]];
  for (let i = 0; i < points; i++) {
    let xVal = xAmp * (1 - i * step);
    let yVal = yAmp * (1 - i * step);
    let zVal = zAmp * (1 - i * step);
    if (tog) {
      xVal = -xVal;
      yVal = -yVal;
      zVal = -zVal;
    }
    WOWTHISISANAME.push([xVal, yVal, zVal, (i + 1) * step, easing]);

    tog = !tog;
  }
  return WOWTHISISANAME;
}

function offestOnNotesBetween(p1, p2, offset) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    //always worth having.
    //man this shit BETTER not be undefined.
    if (typeof offset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = offset;
    }
  });
  return filterednotes;
}

function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}

function notesAt(times) {
  return _notes.filter(n => times.some(t => n._time == t));
}

function trackOnNotesBetween(track, p1, p2, potentialOffset) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    object._customData._track = track;
    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
    }
  });
  return filterednotes;
}

//applies a track to notes on two tracks between two times based on the color of the notes
//IT GONNA FUCK UP WITH BOMBS I TELL YOU HWAT BOI
//red, blue, p1, p2, potentialOffset
function trackOnNotesBetweenRBSep(trackR, trackB, p1, p2, potentialOffset) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
    }
    if (object._type == 0) {
      object._customData._track = trackR;
    }
    if (object._type == 1) {
      object._customData._track = trackB;
    }
  });
  return filterednotes;
}

function offestOnNotesBetweenRBSep(
  trackR,
  trackB,
  p1,
  p2,
  potentialOffset,
  offsetR,
  offsetB
) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
    }
    if (object._type == 0) {
      object._customData._track = trackR;
      object._customData._noteJumpStartBeatOffset = offsetR;
    }
    if (object._type == 1) {
      object._customData._track = trackB;
      object._customData._noteJumpStartBeatOffset = offsetB;
    }
  });
  return filterednotes;
}

//p1, p2, potentialoffset, up, down, left, right,
//TODO: ADD OTHER DIRS
function trackOnNotesBetweenDirSep(
  p1,
  p2,
  potentialOffset,
  trackUp,
  trackDown,
  trackLeft,
  trackRight
) {
  filterednotes = _notes.filter(n => n._time >= p1 && n._time <= p2);
  filterednotes.forEach(object => {
    if (object._cutDirection == 0 && typeof trackUp !== "undefined") {
      object._customData._track = trackUp;
    }
    if (object._cutDirection == 1 && typeof trackUp !== "undefined") {
      object._customData._track = trackDown;
    }
    if (object._cutDirection == 2 && typeof trackUp !== "undefined") {
      object._customData._track = trackLeft;
    }
    if (object._cutDirection == 3 && typeof trackUp !== "undefined") {
      object._customData._track = trackRight;
    }
    //i might want to make this only run if I assign a track...
    if (typeof potentialOffset !== "undefined") {
      object._customData._noteJumpStartBeatOffset = potentialOffset;
    }
  });
  return filterednotes;
}

//#endregion








//#region BASIC EXAMPLES   -  -  -  -  -  -  -  -  -  -  -  -  -  use these as a copy/paste template for the lazy   -  -  -  -  -  -  -  -  -  -  -  -  -  
/*

_pointDefinitions.push({
  _name: "buildupshake2",
  _points: DecayShakePath(0.5, 0, 0, 50)
});

filterednotes = notesAt([insert specific note time/beat here]);
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = -0.1;       // tbh I only really use this for NJS/offset changes and to remove the spawn effect.
  note._customData._noteJumpMovementSpeed = 17;       
  note._customData._animation = {}
  note._customData._animation._rotation = [[-90, 0, 0, 0],[0,0,0,0.5,"easeOutElastic"]];     // feel free to use any of the other animation properties from the github --- these will add each animation on a per note basis
});

filterednotes = _notes.filter(n => n._time >= 69 && n._time <= 420);
filterednotes.forEach(note => {
  note._customData._track = "dumb track name here";
  note._customData._noteJumpStartBeatOffset = 69;
  note._customData._noteJumpMovementSpeed = 420;
});



trackOnNotesBetween("dumb track name here", start beat here, end beat here, offset here);         // ---- function calling example - use these when possible to get rid of clutter and make life easier

filterednotes = _notes.filter(n => n._time >= 69 && n._time <= 420);
filterednotes.forEach(note => {
  note._customData._track = "dumb track name here";
  note._customData._noteJumpStartBeatOffset = 666;
  note._customData._noteJumpMovementSpeed = 777;
  note._customData._fake = true;
  note._customData._disableSpawnEffect = "true"      // NOTE: removing spawn effect will scuff practice mode if you try and play at a section or track with a note already spawnd that has this property set to true - you need to start playing before these spawn in
});



//use this to push track animations - path animations, track parenting, assigning player to track, etc.
_customEvents.push({
  _time: 69,
  _type: "AnimateTrack",
  _data: {
    _track: "dumb track name here",
    _duration: 420,
    _easing: "easeOutQuad",
    _position: [[0, 0, 0, 0], [0, 10, 10, 1]],
    _rotation: [[0, 180, 0, 0]],
    _dissolve: [[1, 0], [0, 0.8]],
    _dissolveArrow: [[1, 0], [0, 1]]
  }
});       

// you can string together multiple thingies by adding a comma after ""}"" and slapping in another {} thingy - like so

_customEvents.push({
  _time: 69,
  _type: "AnimateTrack",
  _data: {
    _track: "dumb track name here",
    _duration: 420,
    _easing: "easeOutQuad",
    _position: [[0, 0, 0, 0], [0, 10, 10, 1]],
    _rotation: [[0, 180, 0, 0]],
    _dissolve: [[1, 0], [0, 0.8]],
    _dissolveArrow: [[1, 0], [0, 1]]
  }
}, {
  _time: 69,
  _type: "AnimateTrack",
  _data: {
    _track: "dumb track name here",
    _duration: 420,
    _easing: "easeOutQuad",
    _position: [[0, 0, 0, 0], [0, 10, 10, 1]],
    _rotation: [[0, 180, 0, 0]],
    _dissolve: [[1, 0], [0, 0.8]],
    _dissolveArrow: [[1, 0], [0, 1]]
  }
}); 



// alternates beats --- don't use this - it's kinda shit one time use but you get the idea maybe idk
let toggle = false;
let startBeat = 136;
for (let i = 0; i < (196-136); i++){
    if(toggle){
        let currentBeat = startBeat+i;
        _customEvents.push({
            "_time":currentBeat,
            "_type":"AnimateTrack",
            "_data":{
              _track: "slowbuild",
              _duration: 1,
              _scale: [[1.3, 1.3, 1.3, 0], [1, 1, 1, 0.9, "easeOutBack"],[1.3, 1.3, 1.3, 1,"easeInQuart"]],
              //_localRotation: [[0, 20, 0, 0], [0, 0, 0, 1,"easeOutCirc"]], 
              //_dissolve: [[1, 0], [0, 0.8]],
              //_dissolveArrow: [[1, 0], [0, 1]]
            }
        })
    } else {
        let currentBeat = startBeat+i;
        _customEvents.push({
            "_time":currentBeat,
            "_type":"AnimateTrack",
            "_data":{
              _track: "slowbuild",
              _duration: 1,
              _scale: [[1.3, 1.3, 1.3, 0], [1, 1, 1, 0.9, "easeOutBack"],[1.3, 1.3, 1.3, 1,"easeInQuart"]],
              //_localRotation: [[0, -20, 0, 0], [0, 0, 0, 1,"easeOutCirc"]],
              //_dissolve: [[1, 0], [0, 0.8]],
              //_dissolveArrow: [[1, 0], [0, 1]]
            }
        })
    }
    toggle = !toggle;
}
//#endregion
*/


//#region                       -  -  -  -  -  -  -  -  -  -  -  -  -  DO YOUR DIRTY WORK HERE  -  -  -  -  -  -  -  -  -  -  -  -  -

filterednotes = _notes.filter(n => n._time >= 3 && n._time <= 56); // filter all notes from start to finish of chart | _time = beat
filterednotes.forEach(note => {
  note._customData._noteJumpStartBeatOffset = -0.25; // force offset to stop JD fixer from messing with things.
  note._customData._noteJumpMovementSpeed = 16; // Drop NJS lower than what's shown in the info.dat to get around !bsr filters
});

filterednotes = notesAt([62]); // Grabs note specifically on this beat.
filterednotes.forEach(note => {
  note._customData._track = "light" // assign note to a "track" so I can identify it and animate it with an event later on.
  note._customData._noteJumpStartBeatOffset = 8 // longer offset used so the note is "alive" and on screen for a longer period of time.      
  note._customData._noteJumpMovementSpeed = 26;       
  note._customData._animation = {}
  note._customData._animation._position = [[-0.5, 1, -10, 0]]; // note is centered in the lanes (x,y), and moved back down the highway (z), starting at the beginning of it's life (t)
  note._customData._animation._scale = [[4.20,4.20,4.20,0]]    
  note._customData._animation._dissolve = [[0,0]] // note "block" is made invisible through dissolve, arrow/dot is left untouched to create a large circle down the highway.
  //note._customData._animation._dissolveArrow = [[0,0]] // This section would have dissolved the dot/arrow as well
  //note._customData._animation._color = [[20, 20, 20, 50, 0]] // scrapped this because my brain was smooth and didn't know how to properly time things based on offset/bpm/notes lifetime
});

// Same shit as above, but for the notes you actually hit. 
filterednotes = _notes.filter(n => n._time > 62 && n._time <= 69);
filterednotes.forEach(note => {
  note._customData._track = "train"
  note._customData._noteJumpStartBeatOffset = 8      
  note._customData._noteJumpMovementSpeed = 26;       
  note._customData._animation = {}
  note._customData._animation._position = [[-0.5, 1, -10, 0]];
  note._customData._animation._scale = [[6.9,6.9,6.9,0]] // notes scaled larger to fill the whole tunner environment.
      // in hindsight I shouldn't have adjusted the z scale as this changesthe hitbox as well, wich messes with the timing of the note. 
  note._customData._animation._dissolveArrow = [[0,0]] // Only the arrow is dissolved leaving the large blocks.
  //note._customData._animation._color = [[0.1, 0.1, 0.1, 1, 0]]
});

_customEvents.push({ // pushes a new event in the "_customEvents" array
  _time: 0, // beat when thing happens
  _type: "AnimateTrack", // Animation type | Animate track does everything stuck to "beats" where as "AssignPathAnimation" will animate along a notes lifetime.
  _data: {
    _track: "light",
    _duration: 0, // in hindsight, this isn't required at all as the default duration is 0
    _color: [[200, 200, 200, 500, 0]] // Sets the arrow colour to something well over what the limits should be (0-1) to create a large flash in the background with the games bloom system
  }
});

// same as above, but sets the train colour to a dark grey
_customEvents.push({
  _time: 0,
  _type: "AnimateTrack",
  _data: {
    _track: "train",
    _duration: 0,
    _color: [[0.1, 0.1, 0.1, 1, 0]]
  }
});

//#endregion                     -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  STOP  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -






/*
// This is the thingy that does the stuff with the walls and shit 
JSON.parse(fs.readFileSync("./wallsPre.dat"))._obstacles.forEach(o=>{
  if(o._customData._track!="walls") {
    _obstacles.push(o)

  } else {
    console.log("you should only see this once, if you see it more, exec Eat_Ass.jpg")
    franklinContainer = o;
  }
})
*/

//#region write file
const precision = 4; //decimals to round to  --- use this for better wall precision or to try and decrease JSON file size

const jsonP = Math.pow(10, precision);
const sortP = Math.pow(10, 2);
function deeperDaddy(obj) {
  if (obj)
    for (const key in obj) {
      if (obj[key] == null) {
        delete obj[key];
      } else if (typeof obj[key] === "object" || Array.isArray(obj[key])) {
        deeperDaddy(obj[key]);
      } else if (typeof obj[key] == "number") {
        obj[key] = parseFloat(
          Math.round((obj[key] + Number.EPSILON) * jsonP) / jsonP
        );
      }
    }
}
deeperDaddy(difficulty);

difficulty._notes.sort(
  (a, b) =>
    parseFloat(Math.round((a._time + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b._time + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a._lineIndex + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b._lineIndex + Number.EPSILON) * sortP) / sortP) ||
    parseFloat(Math.round((a._lineLayer + Number.EPSILON) * sortP) / sortP) -
      parseFloat(Math.round((b._lineLayer + Number.EPSILON) * sortP) / sortP)
);
difficulty._obstacles.sort((a, b) => a._time - b._time);
difficulty._events.sort((a, b) => a._time - b._time);

fs.writeFileSync(OUTPUT, JSON.stringify(difficulty, null, 0));

//#endregion
