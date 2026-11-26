var setting = {
  colourblind: false,
  animations: true,
  background: true
}


const HEXDIST = 0.2257

var currentlevel = {
  shape: "hex",
  width: 4,
  height: 4,
  depth: 5,
  target: 1,
  xpos: 0,
  ypos: 0,
  prefill: [
    ["0#","1#","2#","0bh"],
    ["3#","4#","5#","4g"],
    ["0bn","0g","0#","0#"],
    ["0#","0b+","0#","0bv"]
  ]
}

var levels = {
  completed: [],
  loadedlvl: 0,
  total: 32,
  data: {},
  dailydone: []
}

var ui = {
  topbar: 0,
  botbar: 0,
  curscene: "title",
  prevscenes: [],
  transscene: "title",
  context: "fix",
  clickable: {main: true, setting: false, confirm: false},
  button: {},
  slider: {},
  wind: {num: 0, max: 9, dragging: false, simpledrag: false, rect: {x:0,y:0,dx:0,dy:0}, start: null},
  confirmdata: ["", ""]
}

ui.scenelist = {
  "title" : [openmainmenu, mainmenu, closemainmenu],
  "nothing" : [null, drawnothing, null]
}

var anim = {
  val: {
    lvlgrad: 0,
    lvlchek: 0,
    titlesplode: 0,
    menuglide: 500,
    settingglide: 0,
    checkrock: 0,
    cellexpand: 100
  },
  particles: []
}

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

var flag = {
  image: false,
  levels: false,
  init: false,
  edit: false,
  debug: false,
  touch: 0,
  usetouch: false
}

var eggs = {
  speedcell: 0
}

const images = {ui: {}};
const sound = {};
currentlevel.fill = structuredClone(currentlevel.prefill);

console.stdlog = console.log.bind(console);
logs = [];
console.log = function(){
    logs.push(Array.from(arguments));
    console.stdlog.apply(console, arguments);
}

var existingtimechecks = []
var colscheme = {}

function timechecker(text) {
  existingtimechecks.push(text)
  existingtimechecks.push(millis())
}

function preload() { 
  document.title = "Newgame"
  usedfont = loadFont("Roboto-Medium.ttf") // WOO
  secondfont = loadFont("Unispace Bd.otf")
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
  colscheme = loadJSON("colour_scheme.json")
  fetch("answerwords.txt")
    .then(res => res.text())
    .then((text) => {levels.data = text})
  console.log(colscheme)
  // Hazel = loadSound("sound/mus/Hazel.mp3")
  console.log("preload")
  console.log("v001")
}

async function setup() {
  util.canv = createCanvas(windowWidth, windowHeight);
  pixelDensity(1)
  noSmooth()
  ui.mode = windowWidth > windowHeight
  rectMode(CORNER);
  textFont(usedfont);
  backgroundstars()
  loadFromLocal()
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
        aud.musicplayer.queue.push(key)
      } else {
        target[key] = {};
        traverseload(value, target[key], type);
      }
    }
    aud.musicplayer.current = aud.musicplayer.queue[0]
  }
  await Promise.all([
    loadJSON("assets_image.json", data => traverseload(data, images, "image")),
    loadJSON("assets_sfx.json", data => traverseload(data, sound, "sfx")),
    loadJSON("assets_music.json", data => loadmusic(data, aud.muslib))
  ])
    .then(openmainmenu())
    .then(ui.levelselection = {modscroll:0})
    //.then(() => flag.init = true)
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

function convertfilldata() {
  let filldata = structuredClone(currentlevel.prefill)
  currentlevel.width = currentlevel.prefill[0].length
  currentlevel.height= currentlevel.prefill.length
  for (let y = 0; y < currentlevel.height; y++) {
    for (let x = 0; x < currentlevel.width; x++) {
      let build = {
        colour: Number(currentlevel.prefill[y][x][0]), 
        sound: "beep",
        subtype: null,
        bright: 0,
      }
      let affects = []
      if (currentlevel.shape == "tri") {
        if (y > 0 && (x+y)%2 == 1) {affects.push([x, y - 1])}
        if (y < currentlevel.height-1 && (x+y)%2 == 0) {affects.push([x, y + 1])}
      } else {
        if (y > 0) {affects.push([x, y - 1])}
        if (y < currentlevel.height-1) {affects.push([x, y + 1])}
        if (currentlevel.shape == "hex") {
          if (x%2 == 1 && y < currentlevel.height-1) {
            if (x > 0) {affects.push([x - 1, y + 1]);}
            if (x < currentlevel.width-1) {affects.push([x + 1, y + 1]);}
          }
          if (x%2 == 0 && y > 0) {
            if (x > 0) {affects.push([x - 1, y - 1]);}
            if (x < currentlevel.width-1) {affects.push([x + 1, y - 1]);}
          }
        }
      }
      if (x > 0) {affects.push([x - 1, y])}
      if (x < currentlevel.width-1) {affects.push([x + 1, y])}
      switch (currentlevel.prefill[y][x][1]) {
        case "#":
          build.type = "normal";
          build.click = true;
          build.change = true;
          build.sound = "beep"
          break;
        case "g":
          build.type = "glass";
          build.click = false;
          build.change = true;
          break;
        case ".":
          build.type = "grey";
          build.click = false;
          build.change = false;
          break;
        case ",":
          build.type = "empty";
          build.click = false;
          build.change = false;
          break;
        case "b":
          build.type = "button";
          build.click = true;
          build.change = false;
          build.subtype = currentlevel.prefill[y][x][2]
          switch (currentlevel.prefill[y][x][2]) {
            case "n":
              break;
            case "h":
              affects = []
              for (let i = 0; i < currentlevel.width; i++) {
                if (!(currentlevel.shape == "hex" && i % 2 != x % 2)) {
                  affects.push([i, y])
                }
              }
              break;
            case "v":
              affects = []
              for (let i = 0; i < currentlevel.height; i++) {
                affects.push([x, i])
              }
              break;
            case "+":
              affects = []
              for (let i = 0; i < currentlevel.width; i++) {
                if (!(currentlevel.shape == "hex" && i % 2 != x % 2)) {
                  affects.push([i, y])
                }
              }
              for (let i = 0; i < currentlevel.height; i++) {
                affects.push([x, i])
              }
              break;
          }
          break;
      }

      build.affect = affects
      filldata[y][x] = build
    }
  }
  currentlevel.fill = filldata
}

function convertcurrentleveldata() {
  let filldata = structuredClone(currentlevel.fill)
  for (let y = 0; y < currentlevel.height; y++) {
    for (let x = 0; x < currentlevel.width; x++) {
      let data = currentlevel.fill[y][x].colour.toString()
      let convert = {button: "b", normal: "#", grey: ".", glass: "g" }
      data += convert[currentlevel.fill[y][x].type]
      if (data[1] == "b") {
        data += currentlevel.fill[y][x].subtype
      }
      filldata[y][x] = data
    }
  }
  let leveldata = {
    shape: currentlevel.shape,
    depth: currentlevel.depth,
    target: currentlevel.target,
    prefill: filldata
  }
  console.log(JSON.stringify(leveldata,null,4))
  console.log(jsonpretty(leveldata))
}

function levelwin() {
  currentlevel.win = true
  playsfx(sound.game.win)
  confettispawn(13, windowWidth/2, windowHeight, 20)
  //for (let i = 0; i < 11; i++) {
    //confettispawn(13, -windowWidth/8 + i*windowWidth/8, windowHeight, 20)
  //}
  if (ui.context == "fix") {
    let id = str(levels.loadedlvl)
    if (!(levels.completed.includes(id))) {levels.completed.push(id)}
  } else if (ui.context == "dal") {
    if (!hasObject(levels.dailydone, util.today)) {levels.dailydone.push(util.today)}
  }
}

function updateanim() {
  if (ui.curscene == "lvl") {
    for (let y = 0; y < currentlevel.height; y++) {
      for (let x = 0; x < currentlevel.width; x++) {
        if (currentlevel.fill[y][x].bright > 0) {
          currentlevel.fill[y][x].bright -= deltaTime/8
        }
        if (currentlevel.fill[y][x].bright < 0) {
          currentlevel.fill[y][x].bright = 0
        }
      }
    }
  }

  if (ui.curscene == "title") {
    anim.val.titlesplode += deltaTime
  }

  if (ui.curscene == "slct") {
    anim.val.lvlgrad += deltaTime/10
    anim.val.checkrock += deltaTime/2
  }
  if (eggs.speedcell > 0) {eggs.speedcell -= deltaTime/40; if (eggs.speedcell > 500) {eggs.speedcell -= deltaTime/20}}
  for (let prop in anim.val) {
    anim.val[prop] = withinRange(anim.val[prop], 1000)
  }
  if (anim.val.cellexpand < 100) {
    anim.val.cellexpand += deltaTime/200 * (100-anim.val.cellexpand)
    if (anim.val.cellexpand > 100) {anim.val.cellexpand = 100}
  }

  if (ui.clickable.setting || ui.clickable.confirm) {
    if (anim.val.settingglide < 500) {{anim.val.settingglide += 1.6*deltaTime; if (anim.val.settingglide > 500) {anim.val.settingglide = 500}}}
  } else {if (anim.val.settingglide > 0) {anim.val.settingglide -= 1.6*deltaTime; if (anim.val.settingglide > 500) {anim.val.settingglide = 0}}}

  if (!setting.animations) {
    anim.val.menuglide = 500
    anim.val.titlesplode = 0
    anim.val.lvlgrad = 0
    anim.val.checkrock = 314
    anim.val.cellexpand = 100
    if (ui.clickable.setting) {anim.val.settingglide = 500} else {anim.val.settingglide = 0}
  }
  if (anim.val.menuglide > 500) {anim.val.menuglide -= 1.3*deltaTime; if (anim.val.menuglide < 500) {anim.val.menuglide = 500}}
  if (anim.val.menuglide < 500) {anim.val.menuglide += 1.3*deltaTime; if (anim.val.menuglide > 500) {anim.val.menuglide = 500}}
}

function returnback() {
  if (ui.prevscenes[ui.prevscenes.length-1]) {
    ui.prevscenes[0] = ui.curscene
    ui.curscene = "title"
  } else {
    ui.curscene = ui.prevscenes[ui.prevscenes.length-1]
    ui.prevscenes.pop()
  }
  anim.val.menuglide = 0
}

function drawtopbars() {
  ui.topbar = windowHeight/6
  ui.greytopbar = windowHeight/10
  noStroke()
  fill(colscheme.border)
  rect(-4,-4,windowWidth+8, ui.greytopbar +4)
  fill(colscheme.menu)
  rect(-4,-4,windowWidth+8, 9*ui.greytopbar/10 +4)
  textAlign(CENTER, CENTER)
  fill(colscheme.border)
  textSize(20)
  //text("Experiment", windowWidth/2, windowHeight/48)
  ui.button.settings = {x: windowWidth - 8*ui.greytopbar/10,
    y: ui.greytopbar/10,
    dx: 7*ui.greytopbar/10,
    dy: 7*ui.greytopbar/10,
    type: HAND,
    func: opensettings,
    avail: "main"
  }
  try {
    iconimage(images.ui.settings, ui.button.settings)
  } catch (error) {
    console.log("BAD")
    console.log(error)
    console.log(flag.init)
    console.log(structuredClone(images))
    console.log(ui.button.settings)
  }
  if (ui.prevscenes.length) {
    ui.button.back = {x: ui.greytopbar/10,
      y: ui.greytopbar/10,
      dx: 7*ui.greytopbar/10,
      dy: 7*ui.greytopbar/10,
      type: HAND,
      func: returnback,
      avail: "main"
    }
    iconimage(images.ui.back, ui.button.back)
    if (ui.curscene === "lvl") {
      let whatisit
      if (ui.context === "dal") {
        whatisit = "Daily"
      } else {
        whatisit = levels.loadedlvl
      }
      drawadvancedtext(whatisit, windowWidth/2, 4*ui.greytopbar/10, windowWidth-8*ui.greytopbar/5, 8*ui.greytopbar/10, CENTER, CENTER, 1)
    }
  } else {delete ui.button.back}
}

function drawtopinfo(xmove) {
  ui.topbar = windowHeight/6
  noStroke()
  fill(colscheme.border)
  rect(xmove,-4,windowWidth+8, ui.topbar +4)
  fill(colscheme.banner)
  rect(xmove,-4,windowWidth+8, 9*ui.topbar/10 +4)
  let infotext = "%REPLACE%"
  textSize(lodgetextsize(infotext, 2*ui.topbar/10, 3*windowWidth/4))
  fill(colscheme.border)
  textAlign(CENTER, CENTER)
  if (currentlevel.win) {
    text("Completed!", windowWidth/2 + xmove, 7.2*ui.topbar/10) // replace infotext
  }
  else {text(infotext, windowWidth/2 + xmove, 7.2*ui.topbar/10)}
  drawbotbars(xmove)
}

function nextlevel() {
  delete ui.button.nextlevel
  levels.loadedlvl = str(Number(levels.loadedlvl)+1).padStart(2, "0")
  for (let prop in levels.data[levels.loadedlvl]) {
    currentlevel[prop] = levels.data[levels.loadedlvl][prop]
  }
  currentlevel.win = false
  convertfilldata()
  anim.val.cellexpand = 0
}

function drawbotbars(xmove) {
  ui.botbar = windowHeight/10
  noStroke()
  fill(colscheme.border)
  rect(xmove, windowHeight-ui.botbar, windowWidth+8, ui.botbar +4)
  fill(colscheme.menu)
  if (currentlevel.win) {fill(colscheme.green)}
  rect(xmove, windowHeight-9*ui.botbar/10, windowWidth+8, 8*ui.botbar/10 +4)

  fill(colscheme.border)
  drawadvancedtext("Target Colour:        ", windowWidth/100 + xmove, windowHeight - 5*ui.botbar/10, 3 * windowWidth / 4, 6*ui.botbar/10, LEFT, CENTER, 1)
  fill(colourcell[currentlevel.target])
  stroke(colscheme.cellfill)
  let targsize = textWidth("#")*2
  strokeWeight(targsize/5)
  drawcell(textWidth("Target Colour:  ") + windowWidth/100 + xmove, windowHeight - 9*ui.botbar/20 - targsize/2, targsize, currentlevel.target, targsize/16, "squ", "normal", null, 0)
  //rect(textWidth("Target Colour:  ") + windowWidth/100, windowHeight - 10*ui.botbar/20 - targsize/4, targsize, targsize)

  let iconwidth = Math.min(ui.botbar, windowWidth/6)

  ui.button.restart = {x: windowWidth - 9*iconwidth/10 + xmove,
    y: windowHeight - ui.botbar/2 - 2*iconwidth/5,
    dx: 9*iconwidth/10,
    dy: 9*iconwidth/10,
    type: HAND,
    func: convertfilldata,
    avail: "main"
  }
  image(images.ui.restart, ui.button.restart.x, ui.button.restart.y, ui.button.restart.dx, ui.button.restart.dy)
}

function openconfirmation(type) {
  switch (type) {
    case "reset":
      ui.confirmdata = ["reset", "Are you sure you want to reset all data? (level completions, etc.)"]
      break;
  }
  ui.clickable.setting = false
  ui.clickable.confirm = true
}

function closeconfirmation() {
  delete ui.button.yes
  delete ui.button.no
  ui.confirmdata = ["", ""]
  ui.clickable.setting = true
  ui.clickable.confirm = false
}



function drawconfirmation(data) {
  fill("#00000090")
  rect(0,0,windowWidth, windowHeight)
  fill("#FFF")
  stroke("#000")
  let width = lodgeimage(1, 0.5, windowWidth/2, (windowHeight-ui.topbar)/2)
  strokeWeight(width/100)
  rect(windowWidth/2 - width/2, windowHeight/2 - width/4, width, width/2)
  ui.button.yes = {x: windowWidth/2 - 9*width/20,
    y: windowHeight/2 + width/12,
    dx: 2*width/5,
    dy: width/8,
    type: HAND,
    func: confirmyes,
    avail: "confirm"
  }
  ui.button.no = {x: windowWidth/2 + 1*width/20,
    y: windowHeight/2 + width/12,
    dx: 2*width/5,
    dy: width/8,
    type: HAND,
    func: closeconfirmation,
    avail: "confirm"
  }
  fill(colscheme.green)
  iconbg(ui.button.yes)
  fill(colscheme.red)
  iconbg(ui.button.no)
  textSize(lodgetextsize(data, 7*width/16, width, 2))
  textAlign(CENTER, CENTER)
  fill("#000")
  noStroke()
  drawadvancedtext(data, windowWidth/2, windowHeight/2 - width/12, 7*width/8, 7*width/24, CENTER, CENTER, 3)
  //text(data, windowWidth/2 - width/2, windowHeight/2 - width/8, 7*width/8)
  textSize(lodgetextsize("Yes", ui.button.yes.dy/1.01, ui.button.yes.dx/1.01))
  textAlign(CENTER, CENTER)
  text("Yes", ui.button.yes.x + ui.button.yes.dx/2, ui.button.yes.y + ui.button.yes.dy/2)
  text("No", ui.button.no.x + ui.button.no.dx/2, ui.button.no.y + ui.button.no.dy/2)
}
function confirmyes() {
  switch (ui.confirmdata[0]) {
    case "reset":
      resetAll()
      break;
  }
  closeconfirmation()
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

function drawtransition(previousscreen, nextscreen, direction) {
  let glidenum = (anim.val.menuglide-500) * windowWidth / 500
  //console.log(glidenum)
  if (direction) { // prevdraw
    drawscreen(windowWidth + glidenum, ui.greytopbar, windowWidth, windowHeight - ui.greytopbar, previousscreen)
  } else {
    drawscreen(-windowWidth + glidenum, ui.greytopbar, windowWidth, windowHeight - ui.greytopbar, previousscreen)
  } // nextdraw
  drawscreen(glidenum, ui.greytopbar, windowWidth, windowHeight - ui.greytopbar, nextscreen)
}

function drawnothing(xstart, ystart, xspace, yspace) {
  fill("#500")
  rect(xstart,ystart,xspace,yspace)
}

function drawscreen(xstart, ystart, xspace, yspace, context) {
  ui.scenelist[context][1](xstart, ystart, xspace, yspace)
}

function newscene(prev, next) {
  if (ui.curscene == "title") {
    ui.prevscenes = ["title"]
  } else {
    ui.prevscenes.push(prev)
  }
  ui.curscene = next
}
/*switch (ui.curscene) {
  case "lvl":
    findpuzzledim(windowWidth, windowHeight - ui.topbar - ui.botbar, ui.topbar)
    drawgrid(currentlevel.xpos + glidenum(), currentlevel.ypos, currentlevel, currentlevel.cellsize)
    timechecker("madegrid")
    drawtopinfo(glidenum())
    if (anim.val.menuglide !== 500) {
      if (ui.context === "fix") {
        levelselectscene(windowWidth/100 + glidenum() - windowWidth, ui.greytopbar+windowWidth/100, windowHeight - windowWidth/100, 93*windowWidth/100, "draw", ui.mode)
      } else {mainmenu(windowWidth/100 + glidenum() - windowWidth, ui.greytopbar+windowWidth/100, windowWidth - windowWidth/50, windowHeight - windowWidth/50 - ui.greytopbar, ui.mode)}
    }
    break
  case "slct":
    levelselectscene(windowWidth/100 + glidenum(), ui.greytopbar+windowWidth/100, windowHeight - windowWidth/100, 93*windowWidth/100, "draw", ui.mode)
    timechecker("slctscene")
    if (anim.val.menuglide !== 500) {
      drawgrid(currentlevel.xpos + glidenum() + windowWidth, currentlevel.ypos, currentlevel, currentlevel.cellsize); 
      drawtopinfo(glidenum() + windowWidth); 
      mainmenu(windowWidth/100 + glidenum() - windowWidth, ui.greytopbar+windowWidth/100, windowWidth - windowWidth/50, windowHeight - windowWidth/50 - ui.greytopbar, ui.mode)
    }
    let buttoncurs = levelselectscene(windowWidth/100, ui.greytopbar+windowWidth/100, windowHeight - windowWidth/100, 93*windowWidth/100, "detect", ui.mode)
    if (buttoncurs && buttoncurs < 1.3*levels.completed.length + 4 && ui.clickable.main) {cursor(HAND)}
    break
  case "title":
    mainmenu(windowWidth/100 + glidenum(), ui.greytopbar+windowWidth/100, windowWidth - windowWidth/50, windowHeight - windowWidth/50 - ui.greytopbar, ui.mode)
    timechecker("menu")
    if (anim.val.menuglide !== 500) {
      if (ui.context == "fix") {
        levelselectscene(windowWidth/100 + glidenum() + windowWidth, ui.greytopbar+windowWidth/100, windowHeight - windowWidth/100, 93*windowWidth/100, "draw", ui.mode)
      } else {
        drawgrid(currentlevel.xpos + glidenum() + windowWidth, currentlevel.ypos, currentlevel, currentlevel.cellsize); 
        drawtopinfo(glidenum() + windowWidth); 
      }
    }
    break
}*/

function draw() { // here
  //background("#ff39d1");
  textAlign(LEFT,BASELINE);
  rectMode(CORNER)
  fill("#000000")
  noStroke()
  cursor(ARROW)
  existingtimechecks = []
  timechecker("init")
  updateanim()
  timechecker("anim")
  image(paintbg, 0, 0)
  if(setting.background){
    for(let i = 0; i < stars.length; i++){
      let st = stars[i]
      let a = st.basealpha * (0.5 + 0.5 * sin(st.phase + frameCount * st.twspeed))
      if(a < 20){
        st.x = random(width)
        st.y = random(height)
      }
      fill(Math.min(255, 255 - (st.s-1)*70), 200, Math.min(255, 255 + (st.s-2)*70), a)
      ellipse(st.x, st.y, st.s, st.s)
    }
  }
  timechecker("bg")
  if (flag.init) {
    musichandler()
    function glidenum() {return (anim.val.menuglide-500) * windowWidth / 500}
    timechecker("beforescene")
    if (anim.val.menuglide !== 500) {
      drawtransition(ui.prevscenes[ui.prevscenes.length-1], ui.curscene, anim.val.menuglide <500)
    } else {drawscreen(0, ui.greytopbar, windowWidth, windowHeight-ui.greytopbar, ui.curscene)}
    //timechecker("scenedone")
    confettiupdate()
    //timechecker("confetti")
    drawtopbars()
    //timechecker("topbar")
    if (ui.clickable.setting || anim.val.settingglide > 0 || ui.clickable.confirm) {
      drawsettings(0, ui.greytopbar, windowWidth, windowHeight - ui.greytopbar, ui.mode)
    }
    if (ui.clickable.confirm) {
      drawconfirmation(ui.confirmdata[1])
    }
    //timechecker("setting")
    if (frameCount % 300 === 0) {saveToLocal()}
  } else {
    if (images.ui.logo !== "title_logo.png") {
      flag.init = true
    }
  }
  let buttoncurs = detectbutton(mouseX,mouseY)[1]
  if (buttoncurs) {cursor(buttoncurs)}
  if (flag.touch > 0) {flag.touch -= 1}
  if (flag.usetouch && false) {  
    fill(colscheme.cellfill)
    noStroke()
    textAlign(LEFT, TOP)
    for (let i in logs) {
      text(logs[i], 10, 10+i*20)
  } }
  /*
  timechecker("cursordetect")
  timechecker("lastcheck")
  let timediff = existingtimechecks[existingtimechecks.length-1] - existingtimechecks[existingtimechecks.length-3]
  let totaltimediff = existingtimechecks[1]
  if (frameCount % 60 === 70) {console.log(existingtimechecks[existingtimechecks.length-1] - existingtimechecks[1])}
  for (let i = 2; i < existingtimechecks.length; i += 2) {
    existingtimechecks[i+1] = existingtimechecks[i+1] - totaltimediff - timediff
    totaltimediff += existingtimechecks[i+1]
  }
  if (frameCount % 60 === 70) {
    for (let i = 2; i < existingtimechecks.length; i += 2) {
      console.log(existingtimechecks[i] + " " + str(existingtimechecks[i+1]))
    }
    console.log(" ")
  }
  */
  noStroke()
  fill("#FFF")
  textAlign(LEFT, TOP)
  //rect(0, windowHeight/3, windowWidth, windowHeight/3)
  fill("#000")
  textSize(10)
  text(str(round(anim.val.menuglide)) + " " + ui.curscene + " " + str(ui.prevscenes),0,0)
  //drawadvancedtext("this is a test of the text wrapping system and should not affect you in any way, please just ignore", windowWidth/2, windowHeight/2, windowWidth, windowHeight/3, CENTER, CENTER, 5)
  //fill("#e21cb4")
  //rect(0,0,50,ui.topbar)
  //rect(0,0,100,ui.greytopbar)
  //rect(0,windowHeight-ui.botbar,50,windowHeight)
  //triangle(windowWidth/2-50,0,windowWidth/2,200,windowWidth/2+50,0)
  //if (frameCount % 5 === 0) {text(round(frameRate()), 10, 10)}
}


function mainmenu(xstart, ystart, xspace, yspace) {
  
  noTint()

  ystart += yspace/3
  yspace = 2*yspace/3
  let iconsize = Math.min(xspace/6, yspace/7)
  ui.button.playmain = {x: xstart + xspace/2 - 2*iconsize,
    y: ystart + yspace/2 - 2.5*iconsize,
    dx: 4*iconsize,
    dy: iconsize,
    type: HAND,
    func: openlevelselect,
    avail: "main"
  }
  fill(colscheme.warmfront)
  stroke(colscheme.cellfill)
  strokeWeight(iconsize/10)
  rect(ui.button.playmain.x, ui.button.playmain.y, ui.button.playmain.dx, ui.button.playmain.dy, iconsize/3)
  noFill()
  for (let i = 0; i < 3; i++) {
    let fizzle = i*1000 + anim.val.titlesplode
    let distout = (iconsize/5000)*fizzle*0.5
    stroke(colscheme.cellfill + (round(255*(3000-fizzle)/3000)).toString(16).padStart(2, '0'))
    strokeWeight(round(iconsize*(3000-fizzle)/4000)/10)
    rect(ui.button.playmain.x - distout, ui.button.playmain.y - distout, ui.button.playmain.dx + 2*distout, ui.button.playmain.dy + 2*distout, iconsize/3 + distout/4)
  }

  ui.button.daily = {x: xstart + xspace/2 - 2*iconsize,
    y: ystart + yspace/2 - 0.5*iconsize,
    dx: 4*iconsize,
    dy: iconsize,
    type: HAND,
    func: dailypuzzleload,
    avail: "main"
  }
  fill(colscheme.warmfront)
  stroke(colscheme.cellfill)
  strokeWeight(iconsize/10)
  rect(ui.button.daily.x, ui.button.daily.y, ui.button.daily.dx, ui.button.daily.dy, iconsize/3)
  noFill()
  for (let i = 0; i < 3; i++) {
    let fizzle = i*1000 + anim.val.titlesplode
    let distout = (iconsize/5000)*fizzle*0.5
    stroke(colscheme.cellfill + (round(255*(3000-fizzle)/3000)).toString(16).padStart(2, '0'))
    strokeWeight(round(iconsize*(3000-fizzle)/4000)/10)
    rect(ui.button.daily.x - distout, ui.button.daily.y - distout, ui.button.daily.dx + 2*distout, ui.button.daily.dy + 2*distout, iconsize/3 + distout/4)
  }
  let donetodays = hasObject(levels.dailydone, util.today)
  stroke(colscheme.cellfill)
  strokeWeight(iconsize/10)
  fill(levels.completed.length >= levels.total ? colscheme.green : colscheme.warmback)
  rect(ui.button.playmain.x + ui.button.playmain.dx/3, ui.button.playmain.y + 7*ui.button.playmain.dy/8, ui.button.playmain.dx/3, ui.button.playmain.dy/2, iconsize/3)
  fill(donetodays ? colscheme.green : colscheme.warmback)
  rect(ui.button.daily.x + ui.button.daily.dx/3, ui.button.daily.y + 7*ui.button.daily.dy/8, ui.button.daily.dx/3, ui.button.daily.dy/2, iconsize/3)
  /*
  ui.button.daily = {x: xstart + xspace/2 - 2*iconsize,
    y: ystart + yspace/2 - 0.5*iconsize,
    dx: 4*iconsize,
    dy: iconsize,
    type: HAND,
    func: dailypuzzleload
  }
  fill(colscheme.banner)
  stroke(colscheme.cellfill)
  strokeWeight(iconsize/10)
  rect(ui.button.daily.x, ui.button.daily.y, ui.button.daily.dx, ui.button.daily.dy, iconsize/3)
  noFill()
  for (let i = 0; i < 3; i++) {
    let fizzle = i*1000 + anim.val.titlesplode
    let distout = (iconsize/5000)*fizzle*0.5
    stroke(colscheme.cellfill + (round(255*(3000-fizzle)/3000)).toString(16).padStart(2, '0'))
    console.log(colscheme.cellfill + (round(255*(3000-fizzle)/3000)).toString(16).padStart(2, '0'))
    strokeWeight(round(iconsize*(3000-fizzle)/4000)/10)
    rect(ui.button.daily.x - distout, ui.button.daily.y - distout, ui.button.daily.dx + 2*distout, ui.button.daily.dy + 2*distout, iconsize/3 + distout/4)
  }
  */
  textAlign(CENTER, CENTER)
  textSize(iconsize/2)
  noStroke()
  fill(colscheme.border)
  text("LEVELS", ui.button.playmain.x + ui.button.playmain.dx/2, ui.button.playmain.y + ui.button.playmain.dy/2.3)
  text("DAILY", ui.button.daily.x + ui.button.daily.dx/2, ui.button.daily.y + ui.button.daily.dy/2.3)
  textSize(iconsize/4.5)
  text(str(levels.completed.length).padStart(2, '0') + "/" + levels.total.toString(), ui.button.playmain.x + ui.button.playmain.dx/2, ui.button.playmain.y + 1.09*ui.button.playmain.dy)
  text(donetodays ? "Completed" : "Available", ui.button.daily.x + ui.button.daily.dx/2, ui.button.daily.y + 1.09*ui.button.daily.dy)
}


// puzzle generation
function dailypuzzleload(falsetoday = "-1", leader = "0000000") {
  if (falsetoday === "-1") {findtoday()}
  else {util.today = falsetoday}
  const dateseed = String(util.today.d).padStart(2, '0') + String(util.today.m).padStart(2, '0') + util.today.y
  util.seed = Number(dateseed + leader)
  delete ui.button.playmain
  delete ui.button.daily
  anim.val.menuglide = 999
}

function openlevelselect() {
  ui.context = "fix"
  delete ui.button.playmain
  delete ui.button.daily
  anim.val.menuglide = 999
  newscene(ui.curscene, "nothing")
}

function openmainmenu() {
  //loadlevel("title")
  //titleused = Array(currentlevel.width * currentlevel.height).fill(6)
}
function closemainmenu() {}


// taking inputs
// mouse
function pointerPressed() {
  if (mouseX<20 && mouseY<20) {logs.length=0}
  sound.ui.empty.setVolume(0)
  sound.ui.empty.play()
  //triggerpress(1,2)
  //console.log(currentlevel)
  if (ui.clickable.main) {
    if (ui.curscene == "lvl") {
      let gridpress = detectgridclick(mouseX, mouseY, currentlevel.shape)
      if (gridpress != null) {
        triggerpress(gridpress[0], gridpress[1])
      }
    }
    if (ui.curscene == "slct" && mouseY > ui.greytopbar) {
      if ((mouseX > ui.wind.rect.x - ui.wind.rect.dx/3 && mouseX < ui.wind.rect.x + 4*ui.wind.rect.dx/3) && (mouseY > ui.wind.rect.y - 3 && mouseY < ui.wind.rect.y + ui.wind.rect.dy + 3)) {
        ui.wind.dragging = true
        ui.wind.start = [mouseY, ui.wind.num]
        console.log("Wind")
      } else {ui.wind.start = [mouseY, ui.wind.num]}
    }
  }
  let res = detectslider(mouseX, mouseY)
  if (res[0] != null) {
    ui.slider[res[1]].drag = true
  }
  
}

function pointerReleased() {
  if (!ui.wind.simpledrag && !ui.wind.dragging) {
    if (ui.clickable.main) {
      if (ui.curscene == "slct" && mouseY > ui.greytopbar) {
        let lvlid = levelselectscene(windowWidth/100,ui.greytopbar+windowWidth/100, 99999, 93*windowWidth/100, "detect", ui.mode)
        if (lvlid > 0 && (Number(lvlid) < 1.3*levels.completed.length+4 || flag.debug)) {
          ui.curscene = "lvl"
          loadlevel(lvlid)
          playsfx(sound.ui.click)
          return
        }
      }
    }
    let res = detectbutton(mouseX, mouseY) // buttonact
    if (res[0] != null) {
      if (Object.hasOwn(res[2], "ref")) {res[0](res[2].ref)}
      else {res[0]()}
      playsfx(sound.ui.click)
      return
    }
  }
  for (let slidkey in ui.slider) {
    let slid = ui.slider[slidkey]
    if (slid.drag) {
      console.log(slid)
      slid.drag = false
    }
  }
  ui.wind.dragging = false
  ui.wind.simpledrag = false
}

function pointerDragged() {
  console.log("Dragged")
  for (let slidkey in ui.slider) {
    let slid = ui.slider[slidkey]
    if (slid.drag == true) {
      let newval = round(100 * (mouseX - slid.x - slid.w/2) / (slid.dx - slid.w))
      if (newval != slid.adj.n) {
        if (newval < 0) {slid.adj.n = 0; break}
        else if (newval > 100) {slid.adj.n = 100; break}
        slid.adj.n = newval
        playsfx(sound.ui.slider)
        break
      }
    }
  }
  if (ui.clickable.main) {
    if (ui.wind.dragging) {
      ui.wind.num = withinBound(ui.wind.start[1] - (ui.wind.start[0] - mouseY)*ui.wind.max/(ui.wind.bigbarrange-ui.wind.rect.dy), 0, ui.wind.max)
    } else if (ui.curscene === "slct" && mouseY > ui.greytopbar) {ui.wind.simpledrag = true;
      ui.wind.num = withinBound(ui.wind.start[1] - (ui.wind.start[0] - mouseY), 0, ui.wind.max)
    }
  }
}

function mousePressed() {
  if (flag.touch) {return}
  //console.log("Click!", mouseX, mouseY);
  pointerPressed()
}
function mouseDragged() {
  pointerDragged()
}
function mouseReleased() {
  if (flag.touch) {return}
  //console.log("Mouse released", mouseX, mouseY)
  pointerReleased()
}
function mouseWheel(event) {
  ui.wind.num -= event.delta
  ui.wind.num = withinBound(ui.wind.num, 0, ui.wind.max)
}

function touchStarted() { 
  flag.usetouch = true
  //console.log("Touch!", mouseX, mouseY)
  pointerPressed()
}
function touchMoved() {
  pointerDragged()
}
function touchEnded() {
  flag.touch = 5
  //console.log("Touch released", mouseX, mouseY)
  pointerReleased()
}

function saveToLocal() {
  let savedata = {}
  let completedbyid = []
  for (const i in levels.completed) {
    completedbyid.push(levels.data[levels.completed[i]].id)
  }
  savedata.completed = completedbyid
  savedata.daily = levels.dailydone
  localStorage.setItem("light_puzzles", JSON.stringify(savedata))

  let savesettings = {music: aud.musvol, sound: aud.sfxvol, other: structuredClone(setting)}
  localStorage.setItem("settings", JSON.stringify(savesettings))
}

function loadFromLocal() {
  let savedata = JSON.parse(localStorage.getItem("light_puzzles"))
  if (savedata) {
    if (Object.hasOwn(savedata, "completed")) {
      for (const key of Object.keys(levels.data)) {
        if (savedata.completed.indexOf(levels.data[key].id) !== -1) {levels.completed.push(key)}
      }
    }
    if (Object.hasOwn(savedata, "daily")) {levels.dailydone = savedata.daily}
  }

  let savesettings = JSON.parse(localStorage.getItem("settings"))
  if (savesettings) {
    setting = savesettings.other
    aud.musvol = savesettings.music
    aud.sfxvol = savesettings.sound
  }
}

function resetAll() {
  localStorage.clear()
  levels.completed = []
  levels.dailydone = []
  saveToLocal()
}

function toggleFullscreen() { // window stuffs
  let fs = fullscreen();
  fullscreen(!fs);
}
function windowResized() {
  util.canv.remove()
  document.querySelector("canvas").remove()
  util.canv = createCanvas(windowWidth, windowHeight);
  ui.mode = windowWidth > windowHeight
  backgroundstars()
  closeconfirmation()
  closesettings()
  if (ui.wind.num < ui.wind.max) {ui.wind.num = ui.wind.max}
}

document.addEventListener("touchmove", function(e){
  if(e.touches.length > 1){
    e.preventDefault()
  }
}, {passive:false})