let sound
let amp
let levels = []
let times = []
let lastpeak = 0
let bpm = 0

function preload(){
  sound = loadSound("sound/mus/Hazel.mp3")
}

function setup(){
  createCanvas(800,400)
  amp = new p5.Amplitude()
  sound.play()
}

function draw(){
  background(0)
  let level = amp.getLevel()
  levels.push(level)
  times.push(millis())
  if(levels.length > width){
    levels.shift()
    times.shift()
  }

  stroke(0,255,0)
  noFill()
  beginShape()
  for(let i = 0; i < levels.length; i++){
    let y = map(levels[i],0,0.5,height,0)
    vertex(i,y)
  }
  endShape()

  if(level > 0.25 && millis() - lastpeak > 250){
    if(lastpeak != 0){
      let interval = millis() - lastpeak
      bpm = 60000 / interval
    }
    lastpeak = millis()
  }

  fill(255)
  noStroke()
  textSize(16)
  text("bpm: " + bpm.toFixed(1),10,20)
}
