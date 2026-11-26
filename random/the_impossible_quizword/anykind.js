var aud = {
  musvol: {n: 30},
  sfxvol: {n: 30},
  muslib: {},
  musicplayer: {
    effectvol: 1,
    current: null,
    queue: []
  }
}

var util = {
  seed: Math.floor(Math.random()*9990000 + 10000),
  force: {},
  today: null
}
var anim = {
  particles: [],
  qflagtime: 0,
  qstarttime: 0,
  val: {fast:0, mid:0, slow:0},
  actualbombtime: null
}
var ui = {
  usearea: {},
  easarea: {
    x: 1000,
    y: 750
  },
  mouse: {
    x: 0,
    y: 0
  },
  clickables: {

  },
  qflag: 0,
}
var flag = {
  init: false,
  usetouch: false,
  audioplaying: false
}

var eggs = {
  speedcell: 0
}

const images = {ui: {}};
const sound = {};
var animations = []

console.stdlog = console.log.bind(console);
logs = [];
console.log = function(){
    logs.push(Array.from(arguments));
    console.stdlog.apply(console, arguments);
}

var questions = {
  1: {
    q: "Which is a constructor's favourite weapon?",
    a1: "Sword",
    a2: "Epee",
    a3: "Lance",
    a4: "Trebuchet",
    c: [2], w: [1,3,4], n: true
  }
}
var play = {
  q: 0,
  lives: 5,
  bombtime: null,
  gamegood: true
}
var colscheme = {}

function defineusearea() {
  let mult
  if (windowWidth/ui.easarea.x > windowHeight/ui.easarea.y) {
    mult = windowHeight/ui.easarea.y
  } else {
    mult = windowWidth/ui.easarea.x
  }
  ui.usearea.dx = ui.easarea.x * mult
  ui.usearea.dy = ui.easarea.y * mult
  ui.usearea.x = (windowWidth - ui.usearea.dx)/2
  ui.usearea.y = (windowHeight - ui.usearea.dy)/2
}

function preload() { 
  document.title = "Impossible QuizWord"
  usedfont = loadFont("Roboto-Medium.ttf") // WOO
  secondfont = loadFont("Unispace Bd.otf")
  handfont = loadFont("Caveat-Bold.ttf")
  document.addEventListener("keydown", window.scriptKeyListener);
  //usedfont = loadFont("SquareE.ttf")
  findtoday()

  function loadlevels(source, store) {
    for (const key in source) {
      console.log(key, source[key])
      store[key] = source[key]
    }
  }
  //levels.data = fetch("answerwords.txt").trim().split("\n")
  //loadJSON("answerwords.txt", data => loadlevels(data, levels.data))
  loadJSON("assets_image.json", data => loadlevels(data, images))
  loadJSON("assets_music.json", data => loadlevels(data, aud.muslib))
  loadJSON("assets_sfx.json", data => loadlevels(data, sound))
  //colscheme = loadJSON("colour_scheme.json")
  questions = loadJSON("questions.json")
  // Hazel = loadSound("sound/mus/Hazel.mp3")
  console.log("preload")
  console.log("v001")
}

async function setup() {
  util.canv = createCanvas(windowWidth, windowHeight);
  pixelDensity(1)
  noSmooth()
  rectMode(CORNER);
  textFont(usedfont);
  backgroundstars()
  function traverseload(source, target, type) {
    for (const key in source) {
      const value = source[key];
      if (typeof value === "string") {
        console.log(value)
        if (type == "image") {target[key] = loadImage("image/" + value);}
        else if (type == "sfx") {target[key] = loadSound("sound/sfx/" + value);} //target[key].playMode("restart")}
      } else {
        target[key] = {};
        traverseload(value, target[key], type);
      }
    }
  }
  function loadmusic(source, target) {
    for (const key in source) {
      const value = source[key];
      if (typeof value === "string") {
        console.log(value)
        target[key] = loadSound("sound/mus/" + value);
      } else {
        target[key] = {};
        traverseload(value, target[key], type);
      }
    }
  }
  await Promise.all([
    loadJSON("assets_image.json", data => traverseload(data, images, "image")),
    loadJSON("assets_sfx.json", data => traverseload(data, sound, "sfx")),
    loadJSON("assets_music.json", data => loadmusic(data, aud.muslib))
  ])
    .then(() => console.log("setup"))
}
var paintbg
var stars = []
function backgroundstars() {
  paintbg = createGraphics(width, height)
  paintbg.noStroke()
  for(let y = 0; y < height; y += 2){
    let t = y / (height - 1)
    let r = lerp(4, 0, t)
    let g = lerp(7, 2, t)
    let b = lerp(10, 60, t)
    paintbg.fill(r, g, b)
    paintbg.rect(0, y, width, 2)
  }
  numstars = max(300, floor(width * height * 0.00015))
  stars = []
  for(let i = 0; i < numstars; i++){
    stars.push({
      x: random(width),
      y: random(height),
      s: random(0.4, 2.4),
      basealpha: random(120, 255),
      twspeed: random(0.008, 0.06),
      phase: random(Math.PI * 2)
    })
  }
  noStroke()
}
function nextsong() {
  let p = aud.musicplayer
  let lib = aud.muslib
  aud.musicplayer.queue = ["Alkaline", "Cross_Walder", "Forgo_Bego"]
  if (p.current) {
    if (p.queue.indexOf(p.current) >= p.queue.length-1) {
      p.current = p.queue[0]
    } else {
      p.current = p.queue[p.queue.indexOf(p.current)+1]
    }
  } else {
    p.current = p.queue[0]
  }
  if (lib[p.current].isLoaded()) {
    flag.audioplaying = true
    lib[p.current].setVolume(aud.musvol.n**2 * p.effectvol / 10000); 
    lib[p.current].onended(nextsong)
    lib[p.current].play()
  }
}
function stopmusic() {
  aud.muslib[aud.musicplayer.current].onended()
  aud.muslib[aud.musicplayer.current].stop()
}
function updateanim() {
  anim.val.fast += deltaTime
  anim.val.mid += deltaTime/5
  anim.val.slow += deltaTime/50
  for (let prop in anim.val) {
    anim.val[prop] = withinRange(anim.val[prop], 1000)
  }
  if (play.bombtime && !flag.pause) {
    let left = play.bombtime - (millis()-anim.qstarttime)/1000
    if (anim.actualbombtime) {
      if (Math.floor(left) - Math.floor(anim.actualbombtime) && Math.floor(left) > 0) {
        let pitch = Math.floor(left)<4?1.2:1
        playsfx(sound.game.beep,pitch)
      }
      if (Math.floor(left) < 1) {
        gameover(875, 700)
        play.bombtime = null
      }
    }
    anim.actualbombtime = left
  }
}

function confettispawn(count, xspawn, yspawn, power) {
  for (let i = 0; i < count; i++) {
    let ratio = random()**2/4
    anim.particles.push({
      x: xspawn,
      y: yspawn,
      vx: Math.sqrt(ratio*power) * (2*round(random())-1),
      vy: -Math.sqrt((1-ratio)*power) * (2+random())/3,
      color: randint(0,6)
    })
  }
}

function confettiupdate(linkdist = windowWidth/8, linknum=4) {
  let grav = 2
  noStroke()
  for (let partid in anim.particles) {
    let part = anim.particles[partid]
    for (let i = -linknum; i < linknum+1; i++) {
      fill(colourcell[withinRange(part.color + i, 6)])
      circle(part.x + linkdist*i + processseedrand((part.color+30) * (i+549), -10, 10), part.y + processseedrand((part.color+33) * (i+545), 0, 10), 8)
    }
  }
  for (let partid in anim.particles) {
    anim.particles[partid].x += anim.particles[partid].vx/2
    anim.particles[partid].y += anim.particles[partid].vy/2
    anim.particles[partid].vx = anim.particles[partid].vx * (10000-deltaTime)/10000
    anim.particles[partid].vy += grav * deltaTime/1000
  }
  for (let partid = anim.particles.length-1; partid >= 0; partid--) {
    if (anim.particles[partid].y > windowHeight + 40) {
      anim.particles.splice(partid, 1)
    }
  }
}

function createimagelengths(useimage, lengths) {
  let ratio = lodgeimage(useimage.width, useimage.height, lengths.dx, lengths.dy)
  return {dx: useimage.width*ratio, dy: useimage.height*ratio}
}

function putimage(displayimage, coords) {
  let lengths = createimagelengths(displayimage, coords)
  image(displayimage, coords.x - lengths.dx/2, coords.y + coords.dy/2 - lengths.dy/2, lengths.dx, lengths.dy)
}

function translatecoords(x, y, dx = 0, dy = 0) {
  real = {
    x: ui.usearea.x + ui.usearea.dx*x/ui.easarea.x,
    y: ui.usearea.y + ui.usearea.dy*y/ui.easarea.y,
    dx: ui.usearea.dx*dx/ui.easarea.x,
    dy: ui.usearea.dy*dy/ui.easarea.y
  }
  return real
}

function untranslatecoord(x, y) {
  real = {
    x: (x - ui.usearea.x)*ui.easarea.x/ui.usearea.dx,
    y: (y - ui.usearea.y)*ui.easarea.y/ui.usearea.dy
  }
  return real
}

function findmouse() {
  let trad = untranslatecoord(mouseX, mouseY) 
  ui.mouse = {x: round(trad.x), y: round(trad.y)}
}

function pointinrect(x, y, quad) {
  if (x >= quad.x && x <= quad.x + quad.dx) {
    if (y >= quad.y && y <= quad.y + quad.dy) {
      return true
    }
  }
  return false
}

function adjustcoordsbyweight(past, weight) {
  let real = {
    x: past.x + weight/2,
    y: past.y + weight/2,
    dx: past.dx - weight,
    dy: past.dy - weight
  }
  return real
}


function maketext(data, x, y, dx, dy, lines, alignx = CENTER) {
  let real = translatecoords(x, y, dx, dy)
  if (alignx == CENTER) {
    real.x = real.x + real.dx/2
  }
  if (data.length > 6) {
    if (data.substring(0, 6) == "image:") {
      putimage(images.game[data.substring(6, data.length)], real)
      return
    }
  }
  data = str(data)
  let numlines = (data.match(/\n/g) || []).length
  if (numlines) {data=data.replace(/\n/g, " ")}
  drawadvancedtext(data, real.x - real.dy/20, real.y + real.dy/2 - real.dy/20, real.dx, real.dy, alignx, CENTER, numlines?numlines+1:lines)
}

function makerect(x, y, dx, dy, col = "#FFF", strokecol = false, weight = 2, roundness = 0) {
  if (col=="nofill") {noFill()}
  else {fill(col)}
  let real = translatecoords(x, y, dx, dy)
  if (strokecol) {stroke(strokecol); strokeWeight(weight); real = adjustcoordsbyweight(real, weight)}
  else {noStroke()}
  //console.log(real)
  rect(real.x, real.y, real.dx, real.dy, roundness)
}

function maketextbox(data, lines, x, y, dx, dy, col = "#FFF", strokecol = false, weight = 2, roundness = 0) {
  weight = weight * dx/ui.easarea.x
  roundness = roundness * dx/ui.easarea.x
  makerect(x, y, dx, dy, col, strokecol, weight, roundness)
  let border = dy/10
  noStroke()
  fill(strokecol)
  maketext(data, x + border, y + border, dx - 2*border, dy - 2*border, lines)
}

function questiondraw() {
  let thisq = questions[play.q]
  if (thisq.n) {
    let box = [425, 150]
    for (let i = 0; i < 4; i++) { // 50, 300 to 525, 500.
      let points = {x: Math.floor(i/2)*475+50, y: (i%2)*200+300, dx: box[0], dy: box[1]}
      ui.clickables["a" + str(i+1)] = points
      let use = "nothing"
      if (Object.hasOwn(thisq, "ncow")) {
        if (thisq.ncow[i]) {
          use = thisq.ncow[i]
        }
      }
      if (thisq.c.includes(i+1)) {use = "correct"}
      else if (thisq.w.includes(i+1)) {use = "wrong"}
      ui.clickables["a" + str(i+1)].use = use
      let hover = false
      if (!flag.usetouch || touches.length) {hover = pointinrect(ui.mouse.x, ui.mouse.y, points)}
      maketextbox(thisq["a" + str(i+1)], Math.ceil(Math.sqrt(thisq["a" + str(i+1)].length/18)), points.x, points.y, points.dx, points.dy, hover ? "#FF8" : "#FFD", "#000", 4, 20)
    }
    maketext(thisq.q, 100, 50, 800, 200, Math.ceil(Math.sqrt(thisq.q.length/30)))
    fill("#000")
  } else if (thisq.a4 == "bigimageq") {
    fill("#000")
    noStroke()
    maketext(thisq.a1, 200, 100, 600, 550, 1)
    maketext(thisq.q, 100, 25, 800, 75, 1)
  } else if (thisq.a4 == "keyboard") {
    fill("#000")
    noStroke()
    maketext(thisq.a1, 200, 30, 600, 370, 1)
    let real = translatecoords(500, 400, 800, 250)
    putimage(images.ui.keyboard, real)
  }
  if (ui.qflag){
    fill("#000")
    noStroke()
    switch (play.q) {
      case 4:
        makerect(470,500,140, 65, "nofill", "#000", 4, 10)
        break
      case 7:
        maketext("K", 495, 176, 76, 76, 1)
        break
      case 12:
        if (ui.qflag == 1) {
          maketext("You", ui.mouse.x-60, ui.mouse.y-30, 120, 60)
        } else if (ui.qflag == 2) {
          maketext("You", 594, 55, 120, 75)
        } break
      case 15:
        maketext("V", 458, 176, 76, 76, 1)
        break
      case 22:
        makerect(376, 581, 30, 30, "nofill", "#000", 2, 10)
        break
    }
  }

  if (Object.hasOwn(thisq, "custom")) {
    for (let i in thisq.custom) {
      ui.clickables[i] = thisq.custom[i]
    }
  }
}

function mainframedraw(qnum, lnum) {
  //qnum
  thisq = questions[qnum]
  let origin = translatecoords(55, 55, 100)
  noFill()
  strokeWeight(origin.dx/20)
  stroke("#000")
  circle(origin.x, origin.y, origin.dx)
  noStroke()
  fill("#000")
  maketext(str(qnum) + ".", 20, 15, 70, 70, 1)
  fill("#BE6")
  stroke("#000")
  strokeWeight(origin.dx/13)
  maketext("LIVES: " + str(lnum), 20, 650, 600, 100, 1, LEFT)

  if (play.bombtime) {
    let bombtimeleft = Math.floor(anim.actualbombtime)
    let shake = 0
    let realtimeleft = play.bombtime - (millis()-anim.qstarttime)/1000
    let miniadj = 0.5-(realtimeleft*10 - Math.floor(realtimeleft*10))
    switch (bombtimeleft) {
      case 0: break;
      case 1: shake += 8*miniadj;
      case 2: shake += 4*miniadj;
      case 3: shake += 2*miniadj;
      case 4: shake += miniadj;
      case 5: shake += miniadj;
    }
    let real = translatecoords(890+shake, 650, 200, 100)
    putimage(images.ui.bomb, real)
    fill("#053")
    noStroke()
    textFont(usedfont)
    maketext(Math.floor(bombtimeleft), 828+shake, 677, 100, 40, 1)
    textFont(handfont)
  }
}

function title() {
  textFont(handfont)
  fill("#420")
  noStroke()
  maketext("The Impossible QuizWord", 100, 50, 800, 100, 1)
  fill("#000")
  let desc = `This is based on The Impossible Quiz by Splapp-Me-Do in 2007, but this time using Crosswords as the theme. You get 5 lives, lose them all and you have to restart. The answer to each question is not rooted in logic. It could be anything, but you will soon see what that means ;)`
  maketext(desc, 100, 150, 800, 200, 4)
  desc = `This is made for the Why Would You Clue It Like That collab, and a couple questions assume you're filling out that grid :) good luck.`
  maketext(desc, 100, 320, 800, 200, 2)
  let points = {x:250,y:520,dx:500,dy:160, use:"correct"}
  ui.clickables.start = points
  maketextbox("Begin the Quiz", 1, points.x, points.y, points.dx, points.dy, "#EA0", "#000", points.dx/100, points.dx/30)
  //textFont(usedfont)
}
function gameoverscreen() {
  background("#000")
  fill("rgb(129, 69, 9)")
  noStroke()
  maketext("Game Over", 100, 250, 800, 100, 1)
  fill("#000")
  let points = {x:250,y:520,dx:500,dy:160, use:"correct"}
  ui.clickables.start = points
  maketextbox("Go Again?", 1, points.x, points.y, points.dx, points.dy, "rgb(151, 117, 30)", "#1a1212", points.dx/100, points.dx/30)
}
function drawgifs() {
  for (let i = 0; i < animations.length; i++) {
      let a = animations[i]
      let frame = floor((millis() - a.start) / 1000 * 30 * a.playback)

      if (frame >= a.gif.numFrames()) {
          animations.splice(i, 1)
          continue
      }

      a.gif.setFrame(frame)
      image(a.gif, a.x, a.y, a.dx, a.dy)

      //a.x += a.dx
      //a.y += a.dy
  }
}
function startgif(gif, x, y, dx, dy, playback, init) {
  animations.push({
      gif: gif,
      x: x,
      y: y,
      dx: dx,
      dy: dy,
      playback: playback,
      start: millis() - (init),
      done: false
  })
}

function draw() { // here
  background("#bbb");
  textFont(handfont)
  textAlign(LEFT,BASELINE);
  rectMode(CORNER)
  fill("#000000")
  noStroke()
  existingtimechecks = []
  cursor(ARROW)
  updateanim()
  
  //image(paintbg, 0, 0)
  for(let i = 0; i < stars.length; i++){
    let st = stars[i]
    let a = st.basealpha * (0.5 + 0.5 * sin(st.phase + frameCount * st.twspeed))
    if(a < 20){
      st.x = random(width)
      st.y = random(height)
    }
    fill(Math.min(255, 255 - (st.s-1)*70), 200, Math.min(255, 255 + (st.s-2)*70), a)
    //ellipse(st.x, st.y, st.s, st.s)
  }
  if (flag.init) {
    findmouse()
    mousehovering()
    confettiupdate()
    defineusearea()
    fill("#FFFFFF")
    rect(ui.usearea.x, ui.usearea.y, ui.usearea.dx, ui.usearea.dy)
    fill("#000")
    textSize(ui.usearea.dx/40)
    textAlign(CENTER,CENTER)
    text("Make your screen horizontal for best experience!", ui.usearea.x+ui.usearea.dx/2, ui.usearea.y - ui.usearea.dy/30)
    if (play.q > 0) {
      questiondraw()
      mainframedraw(play.q, play.lives)
    } else if (play.q == 0) {
      title()
    } else if (play.q == -1) {
      gameoverscreen()
    }
    drawgifs()
    //image(images.ui.kaboom, 0,0,1000,1000)
  } else {
    if (images.ui.logo !== "title_logo.png") {
      flag.init = true
    }
  }
  if (flag.touch > 0) {flag.touch -= 1}
  noStroke()
  fill("#FFF")
  textAlign(LEFT, TOP)
}


// taking inputs
// mouse
function pointerPressed() {
  sound.ui.empty.setVolume(0)
  sound.ui.empty.play()
  console.log(mouseX, mouseY, ui.mouse.x, ui.mouse.y)
  if (aud.musicplayer.current == null) {nextsong()}
  findmouse()
  if (flag.pause) {return}
  for (let interkey in ui.clickables) {
    let inter = ui.clickables[interkey]
    if (Object.hasOwn(inter, "prepress")) {
      if (pointinrect(ui.mouse.x, ui.mouse.y, inter)) {
        performact(inter.prepress)
        break
      }
    }
  }
}

function mousehovering() {
  anim.highlight = false
  for (let interkey in ui.clickables) {
    let inter = ui.clickables[interkey]
    if (Object.hasOwn(inter, "invis")) {if (inter.invis) {continue}}
    if (pointinrect(ui.mouse.x, ui.mouse.y, inter)) {
      cursor(HAND)
      if (Object.hasOwn(inter, "onhover")) {
        performact(inter.onhover)
        break
      }
    }
  }
}

function performact(act) {
  switch (act) {
    case "nothing": break;
    case "correct": nextquestion(); break
    case "wrong": loselife(); break
    case "hightlight": anim.highlight = true; break
    case "foundit": ui.qflag = 1; anim.qflagtime = millis(); flag.pause=true; playsfx(sound.game.grey,1,1.5);setTimeout(nextquestion, 1200); break
    case "firsttry1": play.lives<5?nextquestion():loselife(); break
    case "firsttry2": play.lives==5?nextquestion():loselife(); break
    case "beginyoudrag": if(ui.qflag==0) {ui.qflag=1}; break
    case "endyourdrag":if(ui.qflag==1) {ui.qflag=2; playsfx(sound.game.grey,1,1.5); setTimeout(nextquestion, 1200)}; break
  }
}

function nextquestion() {
  play.q += 1
  if (Object.hasOwn(questions[play.q], "bomb")) {
    anim.actualbombtime = null
    play.bombtime = questions[play.q].bomb + 0.99
  } else {play.bombtime = null}
  ui.qflag = 0
  anim.qstarttime = millis()
  anim.qflagtime = 0
  ui.clickables = {}
  flag.pause = false
  playsfx(sound.game.correct)
}

function loselife() {
  play.lives -= 1
  let real = translatecoords(120, 560, 300, 300)
  if (play.lives > 0) {
    playsfx(sound.game.wrong, 1, 0.5)
    startgif(images.ui.kaboom, real.x, real.y, real.dx, real.dy, 2, 130)
  } else {gameover(real.x + real.dx/2, real.y + real.dy/2)}
}

function gameover(x,y) {
  flag.pause = true
  let real = translatecoords(x-3000, y-2500,6000,5000)
  startgif(images.ui.kaboom, real.x, real.y, real.dx, real.dy, 1, 0)
  playsfx(sound.game.explosion, 1, 1)
  setTimeout(gameovernow, 800)
}

function gameovernow() {
  ui.clickables = {}
  play.q = -1
  play.lives = 5
  //play.gamegood = false
  flag.pause = false
}

function pointerReleased() {
  if (!flag.audioplaying) {nextsong()}
  findmouse()
  if (flag.pause) {return}
  for (let interkey in ui.clickables) {
    let inter = ui.clickables[interkey]
    if (pointinrect(ui.mouse.x, ui.mouse.y, inter)) {
      performact(inter.use)
      break
    }
  }
  if (play.q == 12 && ui.qflag == 1) {ui.qflag = 0}
}

function pointerDragged() {
  console.log("Dragged")
}

function toggleFullscreen() { // window stuffs
  let fs = fullscreen();
  fullscreen(!fs);
}
function windowResized() {
  util.canv.remove()
  document.querySelector("canvas").remove()
  util.canv = createCanvas(windowWidth, windowHeight);
  backgroundstars()
}

document.addEventListener("touchmove", function(e){
  if(e.touches.length > 1){
    e.preventDefault()
  }
}, {passive:false})