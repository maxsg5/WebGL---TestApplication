"use strict";
const ctx = document.getElementById("music-canvas").getContext("2d");

ctx.fillText("click to start", 100, 75);
ctx.canvas.addEventListener('click', start);  

function start() {
  ctx.canvas.removeEventListener('click', start);
  // make a Web Audio Context
  const context = new AudioContext();
  const analyser = context.createAnalyser();

  // Make a buffer to receive the audio data
  const numPoints = analyser.frequencyBinCount;
  const audioDataArray = new Uint8Array(numPoints);
  console.log(audioDataArray);
  function render() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // get the current audio data
    analyser.getByteFrequencyData(audioDataArray);

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const size = 5;
    

    // draw a point every size pixels
    for (let x = 0; x < width; x += size) {
      // compute the audio data for this point
      const ndx = x * numPoints / width | 0;
      // get the audio data and make it go from 0 to 1
      const audioValue = audioDataArray[ndx] / 255;
      // draw a rect size by size big
      const y = audioValue * height;
      ctx.fillRect(x, y, size, size);
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // Make a audio node
  const audio = new Audio();
  audio.loop = true;
  audio.autoplay = true;

  // this line is only needed if the music you are trying to play is on a
  // different server than the page trying to play it.
  // It asks the server for permission to use the music. If the server says "no"
  // then you will not be able to play the music
  // Note if you are using music from the same domain 
  // **YOU MUST REMOVE THIS LINE** or your server must give permission.
  audio.crossOrigin = "anonymous";

  // call `handleCanplay` when it music can be played
  audio.addEventListener('canplay', handleCanplay);
  audio.src = "https://twgljs.org/examples/sounds/DOCTOR%20VOX%20-%20Level%20Up.mp3";
  audio.load();


  function handleCanplay() {
    // connect the audio element to the analyser node and the analyser node
    // to the main Web Audio context
    const source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);
  }
}