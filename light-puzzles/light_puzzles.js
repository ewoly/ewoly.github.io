var setting = {
  colourblind: false,
  animations: true,
  background: true
}

const colourcell = {
  0: "#f21212",
  1: "#0808fa",
  2: "#0cf10c",
  3: "#ffff2d",
  4: "#fc10fc",
  5: "#10fafa",
}

const HEXDIST = 0.2257

var currentgrid = {
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
  scene: "title",
  context: "fix",
  clickable: {main: true, setting: false, confirm: false},
  button: {},
  slider: {},
  wind: {num: 0, max: 9, dragging: false, simpledrag: false, rect: {x:0,y:0,dx:0,dy:0}, start: null},
  confirmdata: ["", ""]
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
  musvol: {n: 0},
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
currentgrid.fill = structuredClone(currentgrid.prefill);

console.stdlog = console.log.bind(console);
logs = [];
console.log = function(){
    logs.push(Array.from(arguments));
    console.stdlog.apply(console, arguments);
}

var existingtimechecks = []
var colscheme

function timechecker(text) {
  existingtimechecks.push(text)
  existingtimechecks.push(millis())
}

function preload() { 
  document.title = "Light Puzzles"
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
  loadJSON("light_levels.json", data => loadlevels(data, levels.data))
  loadJSON("assets_image.json", data => loadlevels(data, images))
  loadJSON("assets_music.json", data => loadlevels(data, aud.muslib))
  loadJSON("assets_sfx.json", data => loadlevels(data, sound))
  colscheme = loadJSON("colour_scheme.json")
  // Hazel = loadSound("sound/mus/Hazel.mp3")
  console.log("preload")
  console.log("v001")
}

async function setup() {
  createCanvas(windowWidth, windowHeight);
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
    .then(convertfilldata())
    .then(openmainmenu())
    .then(findpuzzledim(windowWidth, windowHeight - 40, 40))
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

function findaffect(x, y, shape, w, h, type = "n") {
  let affects = []
  switch (type) {
    case "n":
      if (shape == "tri") {
        if (y > 0 && (x+y)%2 == 1) {affects.push([x, y - 1])}
        if (y < h-1 && (x+y)%2 == 0) {affects.push([x, y + 1])}
      } else {
        if (y > 0) {affects.push([x, y - 1])}
        if (y < h-1) {affects.push([x, y + 1])}
        if (shape == "hex") {
          if (x%2 == 1 && y < h-1) {
            if (x > 0) {affects.push([x - 1, y + 1]);}
            if (x < w-1) {affects.push([x + 1, y + 1]);}
          }
          if (x%2 == 0 && y > 0) {
            if (x > 0) {affects.push([x - 1, y - 1]);}
            if (x < w-1) {affects.push([x + 1, y - 1]);}
          }
        }
      }
      if (x > 0) {affects.push([x - 1, y])}
      if (x < w-1) {affects.push([x + 1, y])}
      break;
    case "v":
      for (let i = 0; i < h; i++) {
        affects.push([x, i])
      }
      break;
    case "h":
      for (let i = 0; i < w; i++) {
        if (!(shape == "hex" && i % 2 != x % 2)) {
          affects.push([i, y])
        }
      }
      break;
    case "+":
      for (let i = 0; i < h; i++) {
        affects.push([x, i])
      }
      for (let i = 0; i < w; i++) {
        if (!(shape == "hex" && i % 2 != x % 2)) {
          affects.push([i, y])
        }
      }
      break;
  }
  return affects
}

function convertfilldata() {
  let filldata = structuredClone(currentgrid.prefill)
  currentgrid.width = currentgrid.prefill[0].length
  currentgrid.height= currentgrid.prefill.length
  for (let y = 0; y < currentgrid.height; y++) {
    for (let x = 0; x < currentgrid.width; x++) {
      let build = {
        colour: Number(currentgrid.prefill[y][x][0]), 
        sound: "beep",
        subtype: null,
        bright: 0,
      }
      let affects = []
      if (currentgrid.shape == "tri") {
        if (y > 0 && (x+y)%2 == 1) {affects.push([x, y - 1])}
        if (y < currentgrid.height-1 && (x+y)%2 == 0) {affects.push([x, y + 1])}
      } else {
        if (y > 0) {affects.push([x, y - 1])}
        if (y < currentgrid.height-1) {affects.push([x, y + 1])}
        if (currentgrid.shape == "hex") {
          if (x%2 == 1 && y < currentgrid.height-1) {
            if (x > 0) {affects.push([x - 1, y + 1]);}
            if (x < currentgrid.width-1) {affects.push([x + 1, y + 1]);}
          }
          if (x%2 == 0 && y > 0) {
            if (x > 0) {affects.push([x - 1, y - 1]);}
            if (x < currentgrid.width-1) {affects.push([x + 1, y - 1]);}
          }
        }
      }
      if (x > 0) {affects.push([x - 1, y])}
      if (x < currentgrid.width-1) {affects.push([x + 1, y])}
      switch (currentgrid.prefill[y][x][1]) {
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
          build.subtype = currentgrid.prefill[y][x][2]
          switch (currentgrid.prefill[y][x][2]) {
            case "n":
              break;
            case "h":
              affects = []
              for (let i = 0; i < currentgrid.width; i++) {
                if (!(currentgrid.shape == "hex" && i % 2 != x % 2)) {
                  affects.push([i, y])
                }
              }
              break;
            case "v":
              affects = []
              for (let i = 0; i < currentgrid.height; i++) {
                affects.push([x, i])
              }
              break;
            case "+":
              affects = []
              for (let i = 0; i < currentgrid.width; i++) {
                if (!(currentgrid.shape == "hex" && i % 2 != x % 2)) {
                  affects.push([i, y])
                }
              }
              for (let i = 0; i < currentgrid.height; i++) {
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
  currentgrid.fill = filldata
}

function jsonpretty(obj,indentsize){
  if (indentsize==null) indentsize=4
  let indentunit=' '.repeat(indentsize)
  function formatPrimitive(v){
    if (typeof v==='string') return JSON.stringify(v)
    if (v===null) return 'null'
    return String(v)
  }
  function format(value,level){
    if (Array.isArray(value)){
      if (value.length>0 && value.every(a=>Array.isArray(a))){
        let rows=value.map(row=>{
          let items=row.map(formatPrimitive).join(',')
          return indentunit.repeat(level+1)+'['+items+']'
        }).join(',\n')
        return '[\n'+rows+'\n'+indentunit.repeat(level)+']'
      }
      let items=value.map(v=>{
        if (Array.isArray(v)) return format(v,level+1)
        return formatPrimitive(v)
      }).join(', ')
      return '['+items+']'
    }
    if (value && typeof value==='object'){
      let keys=Object.keys(value)
      if (keys.length===0) return '{}'
      let body=keys.map(k=>{
        return indentunit.repeat(level+1)+JSON.stringify(k)+': '+format(value[k],level+1)
      }).join(',\n')
      return '{\n'+body+'\n'+indentunit.repeat(level)+'}'
    }
    return formatPrimitive(value)
  }
  return format(obj,0)
}

function convertcurrentgriddata() {
  let filldata = structuredClone(currentgrid.fill)
  for (let y = 0; y < currentgrid.height; y++) {
    for (let x = 0; x < currentgrid.width; x++) {
      let data = currentgrid.fill[y][x].colour.toString()
      let convert = {button: "b", normal: "#", grey: ".", glass: "g" }
      data += convert[currentgrid.fill[y][x].type]
      if (data[1] == "b") {
        data += currentgrid.fill[y][x].subtype
      }
      filldata[y][x] = data
    }
  }
  let leveldata = {
    shape: currentgrid.shape,
    depth: currentgrid.depth,
    target: currentgrid.target,
    prefill: filldata
  }
  console.log(JSON.stringify(leveldata,null,4))
  console.log(jsonpretty(leveldata))
}

function findpuzzledim(xspace, yspace, ystart, xstart=0) {
  let xreldis = 0
  let yreldis = 0
  if (currentgrid.shape == "squ") {
    xreldis = currentgrid.width
    yreldis = currentgrid.height
  } else if (currentgrid.shape == "tri") {
    xreldis = currentgrid.width / 2 + 0.5
    yreldis = currentgrid.height
  } else if (currentgrid.shape == "hex") {
    xreldis = currentgrid.width * (1-HEXDIST) + HEXDIST
    yreldis = currentgrid.height + 0.5
  }
  if (yreldis * xspace < xreldis * yspace) {
    currentgrid.cellsize = xspace / xreldis
    ystart += yspace / 2 - yreldis * currentgrid.cellsize / 2
    //console.log(ystart, yspace, yreldis, currentgrid.cellsize)
  } else {
    currentgrid.cellsize = yspace / yreldis
  }
  if (currentgrid.shape == "squ") {
    currentgrid.xpos = windowWidth/2 - (currentgrid.width * currentgrid.cellsize / 2) + xstart
  } else if (currentgrid.shape == "tri") {
    currentgrid.xpos = windowWidth/2 - (1+currentgrid.width) * currentgrid.cellsize / 4 + xstart
  } else if (currentgrid.shape == "hex") {
    currentgrid.xpos = windowWidth/2 - (currentgrid.width * currentgrid.cellsize * (1-HEXDIST) / 2) - (currentgrid.cellsize * HEXDIST / 2) + xstart
  }

  currentgrid.ypos = ystart
}

function detectlevelfinish(gridfill, target, w, h) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (gridfill[y][x].type == "normal" || gridfill[y][x].type == "glass") {
        if (gridfill[y][x].colour != target) {
          return false
        }
      }
    }
  }
  return true
}

function gethexvertex(startx, starty, w) {
  let vertices = [
    [startx, starty + w/2],
    [startx + HEXDIST*w, starty],
    [startx + (1-HEXDIST)*w, starty],
    [startx + w, starty + w/2],
    [startx + (1-HEXDIST)*w, starty + w],
    [startx + HEXDIST*w, starty + w]
  ];
  return vertices
}
function getsquvertex(startx, starty, w) {
  let vertices = [
    [startx, starty],
    [startx + w, starty],
    [startx + w, starty + w],
    [startx, starty + w]
  ];
  return vertices
}
function gettrivertex(startx, starty, w, down) {
  let vertices = []
  if (down) {
    vertices = [
      [startx, starty],
      [startx + w, starty],
      [startx + w/2, starty + w]
    ];
  } else {
    vertices = [
      [startx, starty + w],
      [startx + w, starty + w],
      [startx + w/2, starty]
    ];
  }
  return vertices
}

function drawtrifromvertex(v) {
  triangle(v[0][0],v[0][1],v[1][0],v[1][1],v[2][0],v[2][1])
}

function cbshape(x, y, w, c, t, subt=null) {
  noFill()
  switch (t) {
    case "normal":
    case "glass":
      switch (c) {
        case 0:
          rect(x, y, w)
          break;
        case 1:
          rect(x + 2*w/7, y + 2*w/7, 3*w/7)
          break;
        case 2:
          circle(x + w/2, y + w/2, w)
          break;
        case 3:
          circle(x + w/2, y + w/2, 3*w/7)
          break;
        case 4:
          rect(x, y, w)
          circle(x + w/2, y + w/2, 3*w/7)
          break;
        case 5:
          rect(x + 2*w/7, y + 2*w/7, 3*w/7)
          circle(x + w/2, y + w/2, w)
          break;
      }
      break;
    case "button":
      switch (subt) {
        case "n":
          quad(x + w/2, y, x, y + w/2, x + w/2, y + w, x + w, y + w/2);
          break;
        case "v":
          beginShape()
          vertex(x + w/3, y + w/3)
          vertex(x + w/2, y)
          vertex(x + 2*w/3, y + w/3)
          endShape()
          beginShape()
          vertex(x + w/3, y + 2*w/3)
          vertex(x + w/2, y + w)
          vertex(x + 2*w/3, y + 2*w/3)
          endShape()
          break;
        case "h":
          beginShape()
          vertex(x + w/3, y + w/3)
          vertex(x, y + w/2)
          vertex(x + w/3, y + 2*w/3)
          endShape()
          beginShape()
          vertex(x + 2*w/3, y + w/3)
          vertex(x + w, y + w/2)
          vertex(x + 2*w/3, y + 2*w/3)
          endShape()
          break;
        case "+":
          beginShape()
          vertex(x + w/3, y + w/3)
          vertex(x, y + w/2)
          vertex(x + w/3, y + 2*w/3)
          vertex(x + w/2, y + w)
          vertex(x + 2*w/3, y + 2*w/3)
          vertex(x + w, y + w/2)
          vertex(x + 2*w/3, y + w/3)
          vertex(x + w/2, y)
          endShape(CLOSE)
          break;
      }
      break;
  }
}

function drawglass(x, y, w, thickness, shape) {
  fill(colscheme.glass + "63")
  stroke(colscheme.glass)
  strokeWeight(thickness)
  let t = thickness/5
  //w = w-thickness
  switch (shape) {
    case "squ":
      rect(x, y, w)
      line(x + t, y + w/5, x + w/5, y + t)
      line(x + w - t, y + 4*w/5, x + 4*w/5, y + w - t)
      break
    case "triup":
      triangle(x, y + w, x + w/2, y + thickness/2, x + w, y + w)
      line(x + 3*w/10, y + thickness/2 + 2*w/5, x + 6*w/10, y + thickness/2 + w/5)
      line(x + 6*w/10, y + w - 1, x + 9*w/10, y + 4*w/5 + thickness/2)
      break
    case "tridown":
      triangle(x, y, x + w/2, y + w - thickness/2, x + w, y)
      line(x + 4*w/10, y - thickness/2 + 4*w/5,  x + 7*w/10, y - thickness/2 + 3*w/5)
      line(x + 4*w/10, y + 1, x + 1*w/10, y + w/5 - thickness/2)
      break
    case "hex":
      beginShape()
      let vertices = gethexvertex(x, y, w)
      for (let i = 0; i < 6; i++) vertex(vertices[i][0], vertices[i][1])
      endShape(CLOSE)
      line(x + 3*HEXDIST*w/5, y + w/5, x + HEXDIST*w + w/5, y)
      line(x + (1-HEXDIST)*w + 2*HEXDIST*w/5, y + 4*w/5, x + (1-HEXDIST)*w - w/5, y + w)
      break
  }
}

function drawcell(startx, starty, width, colour, thickness, shape, type = "normal", subtype = null, brightness = 0) {
  let expand = anim.val.cellexpand/100
  if (expand !== 1) {
    if (expand <= 0) {return}
    startx = startx + width/2 * (1-expand)
    starty = starty + width/2 * (1-expand)
    width = width*expand
    thickness = thickness*expand
  } 
  let shapecol
  switch (type) {
    case "normal":
    case "glass":
      shapecol = colourcell[colour];
      break;
    case "grey":
      shapecol = colscheme.grey;
      break;
    case "button":
      shapecol = colscheme.cellfill;
      break;
    default:
      shapecol = null
      noFill();
      noStroke();
      return
      break;
  }
  if (shape.includes("tri")) {
    let trivert = gettrivertex(startx, starty, width, shape === "tridown")
    let strokecolour
    if (type == "glass") {strokecolour = colscheme.glass} else {strokecolour = brighten(colscheme.border, brightness)}
    fill(strokecolour)
    stroke(strokecolour)
    strokeWeight(1)
    drawtrifromvertex(trivert)
    fill(colscheme.glass + "63")
    let xadj = 1.618*thickness
    let yadj = 2.236*thickness
    if (shape==="tridown") {trivert = [[startx + xadj, starty + thickness], [startx + width/2, starty + width - yadj], [startx + width - xadj, starty + thickness]]}
    else {trivert = [[startx + xadj, starty + width - thickness], [startx + width/2, starty + yadj], [startx + width - xadj, starty + width - thickness]]}
    noStroke()
    fill(shapecol)
    drawtrifromvertex(trivert)
    stroke(brighten(colscheme.border, brightness))
    strokeWeight(thickness)
    if (shape == "triup") {
      cbshape(startx + 1*width/3, starty + 27*width/48, 1*width/3, colour, type, subtype)
    } else if (shape == "tridown") {
      cbshape(startx + 1*width/3, starty + 5*width/48, 1*width/3, colour, type, subtype)
    }
    if (type == "glass") {
      noStroke()
      fill(colscheme.glass + "63")
      drawtrifromvertex(trivert)
      stroke(colscheme.glass)
      if (shape == "triup") {
        line(startx + 3*width/10 + xadj/2, starty + 2*width/5, startx + 6*width/10 - xadj/2, starty + width/5)
        line(startx + 6*width/10, starty + width - thickness/2, startx + 9*width/10 - xadj/2, starty + 4*width/5)
      } else {
        line(startx + 4*width/10 + xadj/2, starty + 4*width/5,  startx + 7*width/10 - xadj/2, starty + 3*width/5)
        line(startx + 4*width/10, starty + thickness/2, startx + 1*width/10 + xadj/2, starty + width/5)
      }
    }
  } else {
    width = width-thickness
    startx += thickness/2
    starty += thickness/2
    stroke(brighten(colscheme.border, brightness))
    strokeWeight(thickness)
    fill(shapecol)
    if (shape == "squ") {
      rect(startx, starty, width)
      cbshape(startx + width/8, starty + width/8, 3*width/4, colour, type, subtype)
    } else if (shape == "hex") {// 1.14677 0.4514105566241669790272016583962270076253938193150515931699502760859 0.225705278312 0.5486
      beginShape();
      let vertices = gethexvertex(startx, starty, width)
      for (let i = 0; i < 6; i++) {vertex(vertices[i][0], vertices[i][1])}
      endShape(CLOSE);
      cbshape(startx + HEXDIST*width, starty+HEXDIST*width, (1-2*HEXDIST)*width, colour, type, subtype)
    }
    if (type == "glass") {drawglass(startx, starty, width, thickness, shape)}
  }
  strokeWeight(1)
  stroke(colscheme.border)
}

function drawgrid(startx, starty, griddata, size) {
  if (griddata.shape == "squ") {
    for (let y = 0; y < griddata.height; y++) {
      for (let x = 0; x < griddata.width; x++) {
        drawcell(startx + x*size, starty + y*size, size, griddata.fill[y][x].colour, size/20, "squ", griddata.fill[y][x].type, griddata.fill[y][x].subtype, griddata.fill[y][x].bright)
      }
    }
  } else if (griddata.shape == "tri") {
    for (let y = 0; y < griddata.height; y++) {
      for (let x = 0; x < griddata.width; x++) {
        drawcell(startx + x*size/2, starty + y*size/1.00, size, griddata.fill[y][x].colour, size/20, (y+x)%2 == 0 ? "triup" : "tridown", griddata.fill[y][x].type, griddata.fill[y][x].subtype, griddata.fill[y][x].bright)
      }
    }
  } else if (griddata.shape == "hex") {
    for (let y = 0; y < griddata.height; y++) {
      for (let x = 0; x < griddata.width; x++) { 
        drawcell(startx + x*size*(1-HEXDIST), starty + y*size + x%2 * size/2, size, griddata.fill[y][x].colour, size/20, "hex", griddata.fill[y][x].type, griddata.fill[y][x].subtype, griddata.fill[y][x].bright)
      }
    }
  }
}

function adjtrigger(cellx, celly) {
  let regardedcell = currentgrid.fill[celly][cellx]
  if (regardedcell.change) {
    if (regardedcell.colour > currentgrid.depth-1) {
      currentgrid.fill[celly][cellx].colour = 0
    } else {
      currentgrid.fill[celly][cellx].colour += 1
    }
    currentgrid.fill[celly][cellx].bright = 120
  }
}

function triggerpress(cellx, celly, sfx = true) {
  let regardedcell = currentgrid.fill[celly][cellx]
  //console.log(regardedcell)
  let soundtype = regardedcell.type
  if (soundtype === "button") {soundtype = "normal"}
  eggs.speedcell += 10
  if (soundtype !== "empty" && sfx) {playsfx(sound.game[soundtype], eggs.speedcell > 100 ? (eggs.speedcell-100)/200 + 1 : 1)}
  if (regardedcell.click) {
    for (let i = 0; i < regardedcell.affect.length; i++) {
      adjtrigger(regardedcell.affect[i][0], regardedcell.affect[i][1])
    }
    adjtrigger(cellx, celly)
  }
  if (!currentgrid.win && detectlevelfinish(currentgrid.fill, currentgrid.target, currentgrid.width, currentgrid.height)) {levelwin()}
}


function levelwin() {
  currentgrid.win = true
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
  if (ui.scene == "lvl") {
    for (let y = 0; y < currentgrid.height; y++) {
      for (let x = 0; x < currentgrid.width; x++) {
        if (currentgrid.fill[y][x].bright > 0) {
          currentgrid.fill[y][x].bright -= deltaTime/8
        }
        if (currentgrid.fill[y][x].bright < 0) {
          currentgrid.fill[y][x].bright = 0
        }
      }
    }
  }

  if (ui.scene == "title") {
    anim.val.titlesplode += deltaTime
  }

  if (ui.scene == "slct") {
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
  if (ui.scene === "slct") {ui.scene = "title"; openmainmenu()}
  if (ui.scene === "lvl") {
    if (ui.context === "fix") {ui.scene = "slct"; levels.loadedlvl = 0; delete ui.button.nextlevel}
    else if (ui.context === "dal") {ui.scene = "title"; openmainmenu()}
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
  if (ui.scene != "title") {
    ui.button.back = {x: ui.greytopbar/10,
      y: ui.greytopbar/10,
      dx: 7*ui.greytopbar/10,
      dy: 7*ui.greytopbar/10,
      type: HAND,
      func: returnback,
      avail: "main"
    }
    iconimage(images.ui.back, ui.button.back)
    if (ui.scene === "lvl") {
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
  let infotext = "Turn all light cells into target colour"
  textSize(lodgetextsize(infotext, 2*ui.topbar/10, 3*windowWidth/4))
  fill(colscheme.border)
  textAlign(CENTER, CENTER)
  if (currentgrid.win) {
    text("Completed!", windowWidth/2 + xmove, 7.2*ui.topbar/10)
    if (levels.total != levels.loadedlvl && ui.scene === "lvl" && ui.context === "fix") {
      ui.button.nextlevel = {x: windowWidth/2 + textWidth("Completed!#")/2 + xmove,
        y: 6.5*ui.topbar/10,
        dx: 2*ui.topbar/10,
        dy: 2*ui.topbar/10,
        type: HAND,
        func: nextlevel,
        avail: "main"
      }
      let shape = ui.button.nextlevel
      rect(shape.x, shape.y + shape.dy/3, 2*shape.dx/3, shape.dy/3)
      triangle(shape.x + 2*shape.dx/3, shape.y, shape.x + shape.dx, shape.y + shape.dy/2, shape.x + 2*shape.dx/3, shape.y + shape.dy)
    }
  }
  else {text(infotext, windowWidth/2 + xmove, 7.2*ui.topbar/10)}
  drawbotbars(xmove)
}

function nextlevel() {
  delete ui.button.nextlevel
  levels.loadedlvl = str(Number(levels.loadedlvl)+1).padStart(2, "0")
  for (let prop in levels.data[levels.loadedlvl]) {
    currentgrid[prop] = levels.data[levels.loadedlvl][prop]
  }
  currentgrid.win = false
  convertfilldata()
  anim.val.cellexpand = 0
}

function drawbotbars(xmove) {
  ui.botbar = windowHeight/10
  noStroke()
  fill(colscheme.border)
  rect(xmove, windowHeight-ui.botbar, windowWidth+8, ui.botbar +4)
  fill(colscheme.menu)
  if (currentgrid.win) {fill(colscheme.green)}
  rect(xmove, windowHeight-9*ui.botbar/10, windowWidth+8, 8*ui.botbar/10 +4)

  fill(colscheme.border)
  drawadvancedtext("Target Colour:        ", windowWidth/100 + xmove, windowHeight - 5*ui.botbar/10, 3 * windowWidth / 4, 6*ui.botbar/10, LEFT, CENTER, 1)
  fill(colourcell[currentgrid.target])
  stroke(colscheme.cellfill)
  let targsize = textWidth("#")*2
  strokeWeight(targsize/5)
  drawcell(textWidth("Target Colour:  ") + windowWidth/100 + xmove, windowHeight - 9*ui.botbar/20 - targsize/2, targsize, currentgrid.target, targsize/16, "squ", "normal", null, 0)
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
    switch (ui.scene) {
      case "lvl":
        findpuzzledim(windowWidth, windowHeight - ui.topbar - ui.botbar, ui.topbar)
        drawgrid(currentgrid.xpos + glidenum(), currentgrid.ypos, currentgrid, currentgrid.cellsize)
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
          drawgrid(currentgrid.xpos + glidenum() + windowWidth, currentgrid.ypos, currentgrid, currentgrid.cellsize); 
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
            drawgrid(currentgrid.xpos + glidenum() + windowWidth, currentgrid.ypos, currentgrid, currentgrid.cellsize); 
            drawtopinfo(glidenum() + windowWidth); 
          }
        }
        break
    }
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
  //drawadvancedtext("this is a test of the text wrapping system and should not affet you in any way, please just ignore", windowWidth/2, windowHeight/2, windowWidth, windowHeight/3, CENTER, CENTER, 5)
  //fill("#e21cb4")
  //rect(0,0,50,ui.topbar)
  //rect(0,0,100,ui.greytopbar)
  //rect(0,windowHeight-ui.botbar,50,windowHeight)
  //triangle(windowWidth/2-50,0,windowWidth/2,200,windowWidth/2+50,0)
  //if (frameCount % 5 === 0) {text(round(frameRate()), 10, 10)}
}

function levelselectscene(xstart, ystart, yend, width, mode, orient) {
  let gap, iconsize, rowlen, colnum
  let totallvls = levels.total
  if (orient) { // horizontal
    iconsize = 5*width/48
    gap = width/42
    colnum = 8
  } else { // vertical
    iconsize = 7*width/32
    gap = width/24
    colnum = 4
  }
  staticystart = ystart
  ui.levelselection = {iconsize, gap, totallvls}
  rowlen = Math.ceil(totallvls/colnum)
  ui.wind.max = Math.min(yend - ystart - rowlen*iconsize - (rowlen-1)*gap, 0)
  ystart = ystart + ui.wind.num

  let rockangle = Math.cos(anim.val.checkrock * Math.PI / 500)/4
  function drawtick(x, y, size, weight) {
    strokeWeight(weight)
    stroke(colscheme.border)
    fill(colscheme.green)
    circle(x, y, 2*size)

    function lineofrot(xi, yi, xj, yj, xc, yc, rot) {
      let posi = rotateXY(xi, yi, xc, yc, rot)
      let posj = rotateXY(xj, yj, xc, yc, rot)
      line(posi[0], posi[1], posj[0], posj[1])
    }
    lineofrot(x-3*size/8, y, x-size/8, y+size/2, x, y, rockangle)
    lineofrot(x-size/8, y+size/2, x+3*size/8, y-size/2, x, y, rockangle)
  }
  let loadrow = withinBound(round(-ystart/(iconsize + gap)), rowlen, 0)
  for (let row = loadrow; row < rowlen; row++){
    for (let col = 0; col < colnum; col++) {
      let id = row*colnum + col + 1
      if (id > totallvls) {break}
      let ypos = ystart + row*(iconsize + gap)
      if (ypos > windowHeight + 100) {row = rowlen; break}
      let intid = id
      id = str(id)
      if (intid<10) {id = "0" + id}
      let xpos = xstart + col*(iconsize + gap)
      if (mode == "draw") { 
        colorMode(HSB, 1000) // square
        let colour = "AAAAAA"
        let isavailable = (intid < 1.3*levels.completed.length+4 || flag.debug) && Object.hasOwn(levels.data, id)
        if (isavailable) {colour = color(withinRange(diagonalpattenvalue(col, row, colnum, rowlen)*20 + anim.val.lvlgrad, 1000), 700, 1000)}
        else {colour = color(withinRange(diagonalpattenvalue(col, row, colnum, rowlen)*20 + anim.val.lvlgrad, 1000), 700, 200)}
        fill(colour)
        colorMode(RGB)
        strokeWeight(iconsize/24)
        stroke(colscheme.border)
        rect(xpos, ypos, iconsize)
        if (isavailable) {
          textAlign(CENTER,CENTER) // number
          textSize(0.8*lodgetextsize(id, iconsize, iconsize))
          noStroke()
          fill(colscheme.border)
          text(id, xpos + iconsize/2, ypos + iconsize/2.2)
        } else {
          //image(images.ui.padlock, xpos, ypos, iconsize, iconsize) // locked
        }
        if (levels.completed.includes(id)) {drawtick(xpos+7*iconsize/8, ypos+iconsize/8, iconsize/6, iconsize/24)}
      } else {
        if (mouseX > xpos && mouseX < xpos + iconsize && mouseY > ypos && mouseY < ypos + iconsize) {
          return id
        }
      }
    }
  }
  if (mode == "detect") {return null}

  if (ui.wind.max < -10) {
    let windw = 3*windowWidth/100
    let x = xstart + width + windowWidth/60
    fill(colscheme.grey)
    stroke(colscheme.border)
    strokeWeight(windw/10)
    rect(x, staticystart, windw, yend-staticystart)
    ui.wind.bigbarrange = yend-staticystart
    fill(colscheme.menu)
    let frac = ui.wind.num/ui.wind.max
    let barsize = (windowHeight - ui.greytopbar)**2 / (windowHeight - ui.greytopbar - ui.wind.max)
    ui.wind.rect = {x: x, y: staticystart + frac* (yend-staticystart-barsize), dx: windw, dy: barsize}
    rect(x, staticystart + frac* (yend-staticystart-barsize), windw, barsize)
  }
}


function mainmenu(xstart, ystart, xspace, yspace, orient) {
  
  //findpuzzledim(16*xspace*9/10/18, yspace/6, ystart+yspace/90, xstart)
  //currentgrid.xpos -= currentgrid.cellsize
  //drawgridtitle(currentgrid.xpos,currentgrid.ypos,currentgrid,currentgrid.cellsize)
  let logoratio = lodgeimage(images.ui.logo.width, images.ui.logo.height, 9*xspace/10, yspace/3)
  let logopulse = 0.1*sin(anim.val.titlesplode/1000 * PI) +1
  //tint(80-600*(logopulse-1),255)
  logoratio = logoratio*logopulse
  //image(images.ui.logo, xstart + xspace/2 - images.ui.logo.width*logoratio/2, ystart - images.ui.logo.height*(logopulse-1)/4, images.ui.logo.width*logoratio, images.ui.logo.height*logoratio)
  noTint()
  logoratio = logoratio/logopulse
  image(images.ui.logo, xstart + xspace/2 - images.ui.logo.width*logoratio/2, ystart, images.ui.logo.width*logoratio, images.ui.logo.height*logoratio)

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

function dailypuzzleload(leader = "0000000") {
  findtoday()
  const dateseed = String(util.today.d).padStart(2, '0') + String(util.today.m).padStart(2, '0') + util.today.y
  util.seed = Number(dateseed + leader)
  let theme = {}
  themetype = seedrandint(0,2)
  console.log(themetype)
  switch (themetype) {
    case 0:
      theme.width = 3;
      theme.height = 3;
      break;
    case 1:
    case 2:
      theme.depth = 2
      break;
    case 3:
    case 4:
      theme.depth = 4;
      break;
    case 5:
      theme.width = 4;
      theme.height = 4;
      break;
    case 6:
    case 7:
      theme.symmetry = "lr";
      break;
    case 8:
      theme.symmetry = "ud";
      break;
    
  }
  util.force = theme
  currentgrid = structuredClone(genlightpuzzle(16))
  convertfilldata()
  ui.scene = "lvl"
  ui.context = "dal"
  delete ui.button.playmain
  delete ui.button.daily
  anim.val.menuglide = 999
}
function genlightpuzzle(t) {
  console.log(util.seed)
  let symmetry = false
  if (Object.hasOwn(util.force, "symmetry")) {symmetry = true;}

  let r = {shape: seedrandint(0,2)}
  r.shape = ["tri","squ","hex"][r.shape]
  if (Object.hasOwn(util.force, "shape")) {r.shape = util.force.shape}
  r.width = seedrandint(3,7) // size
  if (Object.hasOwn(util.force, "width")) {r.width = util.force.width}
  if (seedrandint(0,2)) {
    r.height = seedrandint(-1, 1) + r.width
    if (r.height < 3 || r.height > 7) {r.height = r.width}
  } else {
    r.height = r.width
  }
  if (r.shape == "tri" && symmetry) {
    if (util.force.symmetry == "rl" && r.width % 2 == 0) {r.width += 1}
    if (util.force.symmetry == "ud" && r.height % 2 == 1) {r.height += 1}
  }
  if (Object.hasOwn(util.force, "height")) {r.height = util.force.height}

  r.depth = seedrandint(1,5)
  if (Object.hasOwn(util.force, "depth")) {r.depth = util.force.depth}

  r.target = seedrandint(0, r.depth)

  let sh, sz, dp, cs, g, tot
  if (Object.hasOwn(util.force, "prefill")) {
    r.prefill = []
    let convert = {
      "b": "button",
      "#": "normal",
      ".": "grey",
      "g": "glass",
    }
    r.width = util.force.prefill[0].length
    r.height = util.force.prefill.length
    for (let y = 0; y < r.height; y++) {
      let line = []
      for (let x = 0; x < r.width; x++) {
        let val = util.force.prefill[y][x]
        let type = val[0]
        let subtype = "n"
        if (val.length > 1) {subtype = val[1]}
        let pushstat = {type: convert[type], subtype: subtype}
        line.push(pushstat)
      }
      r.prefill.push(line)
    }
  } else {
    r.prefill = []
    for (let y = 0; y < r.height; y++) {
      let line = []
      if (symmetry) {
          if (util.force.symmetry == "ud") {
            if (y >= r.height/2) {
              line = structuredClone(r.prefill[r.height-y-1])
              r.prefill.push(line)
              continue
            }
          }
        }
      for (let x = 0; x < r.width; x++) {
        let c = seedrandint(0,9)
        if (symmetry) {
          if (util.force.symmetry == "lr") {
            if (x >= r.width/2) {
              line.push(structuredClone(line[r.width-x-1]))
              continue
            }
          }
        }
        let subtype = ["n", "v", "h", "+"][seedrandint(0,3)]
        if (c < 5) line.push({type: "normal", subtype: "n"})
        else if (c < 8) line.push({type: "glass", subtype: "n"})
        else if (c < 9) line.push({type: "button", subtype: subtype})
        else line.push({type: "grey", subtype: "n"})
      }
      r.prefill.push(line)
    }

    function adjustcells(r) {
      for (let p = 0; p < 3; p++) {
        for (let y = 0; y < r.height; y++) {
          for (let x = 0; x < r.width; x++) {
            let v = r.prefill[y][x].type
            if (v!="normal") {
              let n = 0
              if (y>0 && r.prefill[y-1][x].type==v) n++
              if (y<r.height-1 && r.prefill[y+1][x].type==v) n++
              if (x>0 && r.prefill[y][x-1].type==v) n++
              if (x<r.width-1 && r.prefill[y][x+1].type==v) n++
              if (n>1) {
                let c = seedrandint(0,9)
                if (c < 6) r.prefill[y][x].type = "normal"
                else if (c < 8) r.prefill[y][x].type = "glass"
                else if (c < 9) r.prefill[y][x].type = "button"
                else r.prefill[y][x].type = "grey"
              }
            }
          }
        }
      }
    }
    if (!symmetry) {adjustcells(r)}
    console.log(r.prefill)
    sh = r.shape=="tri"?1:r.shape=="squ"?2:4
    sz = (r.width*r.height)*0.2
    dp = r.depth*2
    cs = 0
    g = 0
    tot = r.width*r.height

    for (let y = 0; y < r.height; y++) {
      for (let x = 0; x < r.width; x++) {
        let v = r.prefill[y][x].type
        if (v=="normal") cs+=0.35
        if (v=="glass") {cs-=0.05; g++}
        if (v=="button") cs+=0.15
        if (v=="grey") cs-=0.15
      }
    }
  }

  let permu = []
  for (let y = 0; y < r.height; y++) {
    for (let x = 0; x < r.width; x++) {
      if (r.prefill[y][x].type == "glass" || r.prefill[y][x].type == "grey") { // what tiles should each tile affect upon click
        r.prefill[y][x].affect = []
      } else {r.prefill[y][x].affect = findaffect(x, y, r.shape, r.width, r.height, r.prefill[y][x].subtype)}
      //console.log("This affect", r.prefill[y][x].affect, )

      let tokeep = []
      for (let cid in r.prefill[y][x].affect) {
        let c = r.prefill[y][x].affect[cid]
        if (c.length > 1) {
          let t = r.prefill[c[1]][c[0]].type
          if (!(t == "grey" || t == "button")) { // remove tiles it affects if they cant be affected
            tokeep.push(c)
          }
        }
      }
      r.prefill[y][x].affect = tokeep
      if (r.prefill[y][x].affect.length == 0 && !Object.hasOwn(util.force, "prefill") && r.prefill[y][x].type != "grey" && r.prefill[y][x].type != "glass") {return genlightpuzzle(t)} // start over if tile affects nothing
      permu.push([x,y])
    }
  }
  for (let y = 0; y < r.height; y++) {
    for (let x = 0; x < r.width; x++) {
      for (let i = 0; i < permu.length; i++) {
        if (permu[i] != null) {
          if (hasList(r.prefill[y][x].affect, permu[i])) {
            permu[i] = null
          }
        }
      }
    }
  }
  console.log(permu)
  for (let i = 0; i < permu.length; i++) {
    if (permu[i] != null) {
      let celltype = r.prefill[permu[i][1]][permu[i][0]].type
      if (celltype == "glass") {
        return genlightpuzzle(t)
      }
    }
  }

  let cl = 0 // assign number of clicks to each tile
  for (let y = 0; y < r.height; y++) {
    let matchclick = false
    if (symmetry) {if (util.force.symmetry == "ud" && y >= r.height/2) {matchclick = true}}
    for (let x = 0; x < r.width; x++) {
      if (r.prefill[y][x].type == "glass" || r.prefill[y][x].type == "grey") {
        r.prefill[y][x].toclick = 0
      } else {
        r.prefill[y][x].toclick = seedrandint(0, r.depth)
        if (symmetry) {if (util.force.symmetry == "lr" && x >= r.width/2) {r.prefill[y][x].toclick = r.prefill[y][r.width-x-1].toclick}}
        if (matchclick) {r.prefill[y][x].toclick = r.prefill[r.height-y-1][x].toclick}
      }
      r.prefill[y][x].colour = r.target
      if (r.prefill[y][x].toclick>0) {cl += r.prefill[y][x].toclick}
    }
  }
  if (cl < r.height*r.width*r.depth/4) {return genlightpuzzle(t)}
  if (!(Object.hasOwn(util.force, "prefill"))) {
    r.diff = sh+sz+dp+cs+Math.log(cl)
    if (Math.abs(r.diff-t)>1) return genlightpuzzle(t)
  }
  
  for (let y = 0; y < r.height; y++) {
    for (let x = 0; x < r.width; x++) {
      for (let i = 0; i < r.prefill[y][x].toclick; i++) {
        r.prefill[y][x].colour = withinRange(r.prefill[y][x].colour+1, r.depth+1)
        for (let cid in r.prefill[y][x].affect) {
          let c = r.prefill[y][x].affect[cid]
          if (c.length > 1) {
            r.prefill[c[1]][c[0]].colour = withinRange(r.prefill[c[1]][c[0]].colour+1, r.depth+1)
          }
        }
      }
    }
  }
  console.log(structuredClone(r.prefill)) // convert into readable for convertfilldata()
  let assign = {
    "normal" : "#",
    "glass" : "g",
    "grey" : ".",
    "button" : "b",
  }
  for (let y = 0; y < r.height; y++) {
    for (let x = 0; x < r.width; x++) {
      let val = r.prefill[y][x].colour + assign[r.prefill[y][x].type]
      if (r.prefill[y][x].type == "button") {val += r.prefill[y][x].subtype}
      r.prefill[y][x] = val
    }
  }
  return r
}
function customgenlightpuzzle(theme) {
  util.force = theme
  let d = 16
  if (Object.hasOwn(util.force, "diff")) {d = util.force.diff}
  if (Object.hasOwn(util.force, "prefill")) {
    if (theme.prefill[0][0][0] == "0") {
      for (let y = 0; y < theme.prefill.length; y++) {
        for (let x = 0; x < theme.prefill[0].length; x++) {
          util.force.prefill[y][x] = util.force.prefill[y][x].substring(1)
        }
      }
    }
  }
  currentgrid = structuredClone(genlightpuzzle(d))
  console.log(structuredClone(currentgrid))
  convertfilldata()
  ui.scene = "lvl"
  ui.context = "dal"
  delete ui.button.playmain
  delete ui.button.daily
  /*
  customgenlightpuzzle(
  {depth: 1,
height: 5,
prefill: [["#","#","#","#","#"],
["#","#","#","#","#"],
["#","#","#","#","#"],
["#","#","#","#","#"],
["#","#","#","#","#"]],
shape: "squ",
target: 1,
width: 5})
  */
}

function openlevelselect() {
  ui.scene = "slct"
  ui.context = "fix"
  delete ui.button.playmain
  delete ui.button.daily
  anim.val.menuglide = 999
}

function openmainmenu() {
  //loadlevel("title")
  //titleused = Array(currentgrid.width * currentgrid.height).fill(6)
}

function pointinpolygon(px, py, vertices) {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    let xi = vertices[i][0], yi = vertices[i][1];
    let xj = vertices[j][0], yj = vertices[j][1];

    let intersect = ((yi > py) != (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) {inside = !inside};
  }
  return inside;
}

function detectgridclick(clickx, clicky, shape) {
  let tlx = currentgrid.xpos
  let tly = currentgrid.ypos
  let w = currentgrid.cellsize
  if (shape == "squ") {
    for (let y = 0; y < currentgrid.height; y++) {
      for (let x = 0; x < currentgrid.width; x++) {
        let gapnum = 0
        if (ui.scene === "title") {
          gapnum = Math.floor(x / 3)
          if (x>8) {gapnum = Math.floor((x-1) / 3)}
        }
        let vertices = getsquvertex(tlx + x*w + gapnum*w/2, tly + y*w, w)
        if (pointinpolygon(clickx, clicky, vertices)) {
          return [x,y]
        }
      }
    }
  } else if (shape == "tri") {
    for (let y = 0; y < currentgrid.height; y++) {
      for (let x = 0; x < currentgrid.width; x++) {
        let vertices = gettrivertex(tlx + x*w/2, tly + y*w, w, (x+y) % 2)
        if (pointinpolygon(clickx, clicky, vertices)) {
          return [x,y]
        }
      }
    }
  } else if (shape == "hex") {
    for (let y = 0; y < currentgrid.height; y++) {
      for (let x = 0; x < currentgrid.width; x++) {
        let vertices = gethexvertex(tlx + x*w*(1-HEXDIST), tly + y*w + (x%2)*w/2, w)
        if (pointinpolygon(clickx, clicky, vertices)) {
          return [x,y]
        }
      }
    }
  }
  return null
}

function detectbutton(x, y) {
  for (let butkey in ui.button) {
    let but = ui.button[butkey]
    if (Object.hasOwn(but, "avail")) {
      if (!ui.clickable[but.avail]) {continue}
    }
    if (x >= but.x && x <= but.x+but.dx) {
      if (y >= but.y && y <= but.y+but.dy) {
        return [but.func, but.type, but]
      }
    }
  }
  return [null, false]
}

function detectslider(x, y) {
  for (let slidkey in ui.slider) {
    let slid = ui.slider[slidkey]
    let xbeginregion = slid.x + ((slid.dx - slid.w) * slid.adj.n / (slid.max - slid.min))
    if (x >= xbeginregion && x <= xbeginregion + slid.w) {
      if (y >= slid.y && y <= slid.y + slid.dy) {
        return [true, slidkey]
      }
    }
  }
  return [null]
}

function diagonalpattenvalue(x, y, w, h) {
  let d = x + y
  let sum = 0
  for (let dp = 2; dp < d; dp++) {
    let mink = Math.max(1, dp - h)
    let maxk = Math.min(w, dp - 1)
    let cnt = Math.max(0, maxk - mink + 1)
    sum += cnt
  }
  let mink = Math.max(1, d - h)
  let maxk = Math.min(w, d - 1)
  let pos = maxk - x + 1
  return sum + pos
}

function loadlevel(id) {
  levels.loadedlvl = id
  for (let prop in levels.data[id]) {
    currentgrid[prop] = levels.data[id][prop]
  }
  currentgrid.win = false
  convertfilldata()
  anim.val.menuglide = 999
}


// taking inputs
// mouse
function pointerPressed() {
  if (mouseX<20 && mouseY<20) {logs.length=0}
  sound.ui.empty.setVolume(0)
  sound.ui.empty.play()
  //triggerpress(1,2)
  //console.log(currentgrid)
  if (ui.clickable.main) {
    if (ui.scene == "lvl") {
      let gridpress = detectgridclick(mouseX, mouseY, currentgrid.shape)
      if (gridpress != null) {
        triggerpress(gridpress[0], gridpress[1])
      }
    }
    if (ui.scene == "slct" && mouseY > ui.greytopbar) {
      if ((mouseX > ui.wind.rect.x && mouseX < ui.wind.rect.x + ui.wind.rect.dx) && (mouseY > ui.wind.rect.y - 3 && mouseY < ui.wind.rect.y + ui.wind.rect.dy + 3)) {
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
      if (ui.scene == "slct" && mouseY > ui.greytopbar) {
        let lvlid = levelselectscene(windowWidth/100,ui.greytopbar+windowWidth/100, 99999, 93*windowWidth/100, "detect", ui.mode)
        if (lvlid > 0 && (Number(lvlid) < 1.3*levels.completed.length+4 || flag.debug)) {
          ui.scene = "lvl"
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
    } else if (ui.scene === "slct" && mouseY > ui.greytopbar) {ui.wind.simpledrag = true;
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
  createCanvas(windowWidth, windowHeight);
  ui.mode = windowWidth > windowHeight
  backgroundstars()
  closeconfirmation()
  closesettings()
  if (ui.wind.num < ui.wind.max) {ui.wind.num = ui.wind.max}
}