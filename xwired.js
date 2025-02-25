var gridobjectdata = {
  width: 7,
  height: 7,
  name: "",
  selectposition: [0,0,false],
  selectdrag: [-1,-1,-1,-1, 0],
  stored: [],
  copystored: [],
  fullwords: [],
}

var interfacedata = {
  scrolledclues: 0,
  scrolledattri: 0,
  scrolledgen: 0,
  tabopen: 0,
  assignedclues: [],
  generatorwords: [1, [null,""]],
  attris: {width: null, height: null, name: null, desc: null},
  buttons: {},
  errornotice: ["",0,0,0]
}

var gendata = {
  generating: false,
  history: [[null,"bad"],false],
  cluewords: [],
  combforeach: [],
  triedcombos: [],
  totalcombos: [],
  pastgrids: [],
  progression: 0,
  focusindex: 0,
  gridsize: 0,
  mustconnect: true,
  usecurgrid: false,
  usebars: false,
  wallfill: true,
  starttime: 0,
  undolength: 0,
}
var setting = {
  colourblind: false,
}

const colourscheme = {
  cellfill: "#FFFFFF",
  cellwall: "#000000",
  cellshadow: "#BBBBBB",
  celllineselect: "#CCCC60",
  celltrueselect: "#FFFF00",
  background: "#848484",
  backgrounddark: "#545454"
}

const shadecolours = ["#FFFFFF","#ece9ec","#ffa0a0","#caffa0","#9be6ff", "#ddd2ff"] //"#fdffb6" 
const shadesymbols = ["","","R","G","B","V"] 

var undologs = [1]

function preload() { 
  usedfont = loadFont("Roboto-Medium.ttf") // WOO
  //usedfont = loadFont("SquareE.ttf")
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CORNER);
  for (let x = 0; x < 25; x++) {
    let gridline = [];
    for (let y = 0; y < 25; y++) {
      gridline.push({content: "~e", shading: 0, shape: "none", barredx: false, barredy: false, startofclue: [0, false, 0, false, 0]});
    }
    gridobjectdata.stored.push(gridline);
  }
  textFont(usedfont);
  console.log(gridobjectdata);
  undologs.push(structuredClone(gridobjectdata));
  console.log(undologs)
  interfacedata.attris.width = createInput(gridobjectdata.width, "number")
  interfacedata.attris.height = createInput(gridobjectdata.height, "number")
  interfacedata.attris.name = createInput()
  interfacedata.attris.desc = createInput()
}

function randint(min, max) {
  return floor(random()*(max-min)+min);
}

function shufflearray(array) {
  for (var i = array.length - 1; i >= 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function isAlphanumeric(str) { // obtained online
  return /^[a-zA-Z0-9]+$/.test(str);
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function indexOfMax(arr) {
  if (arr.length === 0) {
      return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
          maxIndex = i;
          max = arr[i];
      }
  }

  return [maxIndex,max];
}

function calculateWrappedLines(text, maxWidth) {
  //console.log("made here")
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';

  for (let word of words) {
    let zz = 0
    while (textWidth(word) > maxWidth) {
      zz++
      const splitIndex = findsplitindex(currentLine + word, maxWidth) - currentLine.length;
      if (splitIndex>=0) {
        currentLine += word.slice(0, splitIndex);
        if (currentLine.trim().length > 0) {
          lines.push(currentLine.trim());
          currentLine = '';
        }
        word = word.slice(splitIndex);
      } else {
        lines.push(currentLine.trim());
        currentLine = '';
      }
      if (zz > 10) {
        break
      }
    }
    if (textWidth(currentLine + word + ' ') > maxWidth) {
      if (currentLine.trim().length > 0) {
        lines.push(currentLine.trim());
      }
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }

  if (currentLine.trim().length > 0) {
    lines.push(currentLine.trim());
  }
  return lines;
}

function drawwrappedtext(content, xpos, ypos, boxwidth, lineheight) {
  const lines = calculateWrappedLines(content, boxwidth);
  for (let line of lines) {
    text(line, xpos, ypos);
    ypos += lineheight;
  }
}

function textHeight(text, maxWidth) {
  const lines = calculateWrappedLines(text, maxWidth);
  return lines.length * textLeading();
}

function findsplitindex(word, boxwidth) {
  for (let i = 1; i <= word.length; i++) {
    if (textWidth(word.substring(0, i)) > boxwidth) {
      return i-1;
    }
  }
  return word.length;
}

function toggleFullscreen() {
  let fs = fullscreen();
  fullscreen(!fs);
}

function windowResized() {
  createCanvas(windowWidth, windowHeight);
}

function updateundo() {
  while (undologs[0] != undologs.length-1) {
    undologs.pop(undologs.length-1)
  }
  undologs.push(structuredClone(gridobjectdata))
  undologs[0]++
  if (undologs.length > 50) {
    undologs.splice(1,1)
    undologs[0]--
  }
}

function unredo(type) {
  if (type === 0 && undologs[0] > 1) {
    gridobjectdata = structuredClone(undologs[undologs[0]-1])
    interfacedata.attris.width = createInput(gridobjectdata.width, "number")
    interfacedata.attris.height = createInput(gridobjectdata.height, "number")
    undologs[0]--
  } else if (type === 1 && undologs[0] < undologs.length-1) {
    gridobjectdata = structuredClone(undologs[undologs[0]+1])
    undologs[0]++
  }
}

function changestartdata(axis, x, y, seq) {
  gridobjectdata.stored[x][y].startofclue[axis*2+1] = true;
  let word = gridobjectdata.stored[x][y].content
  let shiftalong = 1;
  if (axis == 0) {
    while (gridobjectdata.stored[x+shiftalong][y].content != "~b" && !gridobjectdata.stored[x+shiftalong-1][y].barredx) {
      word += gridobjectdata.stored[x+shiftalong][y].content
      shiftalong++;
      if (x+shiftalong == gridobjectdata.width) {
        break;
      }
    }
  } else {
    while (gridobjectdata.stored[x][y+shiftalong].content != "~b" && !gridobjectdata.stored[x][y+shiftalong-1].barredy) {
      word += gridobjectdata.stored[x][y+shiftalong].content
      shiftalong++;
      if (y+shiftalong == gridobjectdata.height) {
        break;
      }
    }
  }
  gridobjectdata.stored[x][y].startofclue[axis*2+2] = shiftalong;
  if (!word.includes("~") && (interfacedata.tabopen != 1)) {
    gridobjectdata.fullwords.push([str(seq)+ ((axis === 0) ? "A" : "D"), [x,y,(axis === 0) ? "A" : "D"], word])
  }
}

function findstarts() {
  let startsequence = 1
  for (let y = 0; y < gridobjectdata.height; y++) {
    for (let x = 0; x < gridobjectdata.width; x++) {
      let isastart = false
      gridobjectdata.stored[x][y].startofclue = [0,false,0,false,0]
      if (gridobjectdata.stored[x][y].content != "~b") {
        if (x == 0) { // on left edge
          if (gridobjectdata.stored[x+1][y].content != "~b" && !gridobjectdata.stored[x][y].barredx) { // next cell empty and not barred
            isastart = true;
            gridobjectdata.stored[x][y].startofclue[0] = startsequence;
            changestartdata(0, x, y, startsequence)
          }
        } else if ((gridobjectdata.stored[x-1][y].content == "~b" || gridobjectdata.stored[x-1][y].barredx) && x != gridobjectdata.width-1) { // prev cell walled or barred and away from right edge
          if (gridobjectdata.stored[x+1][y].content != "~b" && !gridobjectdata.stored[x][y].barredx) { // next cell empty and not barred
            isastart = true;
            gridobjectdata.stored[x][y].startofclue[0] = startsequence;
            changestartdata(0, x, y, startsequence)
          }
        }
        if (y == 0) { // on top edge
          if (gridobjectdata.stored[x][y+1].content != "~b" && !gridobjectdata.stored[x][y].barredy) { // next cell empty and not barred
            isastart = true;
            gridobjectdata.stored[x][y].startofclue[0] = startsequence;
            changestartdata(1, x, y, startsequence)
          }
        } else if ((gridobjectdata.stored[x][y-1].content == "~b" || gridobjectdata.stored[x][y-1].barredy) && y != gridobjectdata.height-1) { // prev cell walled or barred and away from right edge
          if (gridobjectdata.stored[x][y+1].content != "~b" && !gridobjectdata.stored[x][y].barredy) { // next cell empty and not barred
            isastart = true;
            gridobjectdata.stored[x][y].startofclue[0] = startsequence;
            changestartdata(1, x, y, startsequence)
          }
        }
      }
      if (isastart) {
        startsequence++;
      }
    }
  }
}

function drawshape(startx, starty, width, colour, thickness, shape) {
  noFill()
  stroke(colour)
  strokeWeight(thickness*gridobjectdata.cellsize/100)
  if (shape == "square") {
    rect(startx, starty, width)
  } else if (shape == "triangle") {
    triangle(startx, starty + width, startx + width/2, starty, startx + width, starty + width)
  } else if (shape == "circle") {
    circle(startx, starty, width)
  } else if (shape == "hexagon") {
    let angle = TWO_PI / 6;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = startx + cos(a) * width/2;
      let sy = starty + sin(a) * width/2;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }
  strokeWeight(1)
  stroke(colourscheme.cellwall)
}

function definedisplayedkeyboard(startx, starty, widthallowed, clickchecker) {
  let keystoshow = ["Q", "W", "E", "R", "T", "Y", "U","I", "O", "A", "S", "D", "F", "G", "H","J", "K", "L", "Z", "X", "C", "V", "B", "N", "M", "P", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Toggle Bar", "Toggle Wall"]
  let keysize = widthallowed / 9
  textAlign(CENTER);
  if (keysize*7 > windowHeight-starty) {
    keysize = (windowHeight-starty)/7
  }
  strokeWeight(widthallowed/243)
  for (y=0;y<4;y++) {
    for (x=0;x<9;x++) {
      if (clickchecker) {
        if (mouseX > startx + x*keysize && mouseX < startx + (x+1)*keysize && mouseY > starty + y*keysize && mouseY < starty + (y+1)*keysize) {
          keypressed(keystoshow[y*9+x])
        }
      } else {
        stroke(0)
        fill("#FFFFFF")
        rect(startx + x*keysize + 1, starty + y*keysize + 1, keysize - 2);
        noStroke()
        textSize(Math.floor(keysize/1.9));
        fill("#000000");
        text(keystoshow[y*9+x], startx+(x+0.5)*keysize, starty+(y+0.5)*keysize + keysize/2/2.8);
      }
    }
  }
  if (clickchecker) {
    if (mouseY > starty + 4*keysize && mouseY < starty + 5*keysize) {
      if (mouseX >= startx && mouseX < startx + 3*keysize) {
        keypressed("Delete")
      } else if (mouseX >= startx + 3*keysize && mouseX < startx + 4.5*keysize) {
        keypressed(".")
      } else if (mouseX >= startx + 4.5*keysize && mouseX < startx + 6*keysize) {
        keypressed(",")
      } else if (mouseX >= startx + 6*keysize && mouseX < startx + 7.5*keysize) {
        keypressed("ctrl z")
      } else if (mouseX >= startx + 7.5*keysize && mouseX < startx + 9*keysize) {
        keypressed("ctrl y")
      }
    }
  } else {
    stroke(0)
    fill("#FFFFFF")
    rect(startx + 1, starty + 4*keysize + 1, 3*keysize - 2, keysize-2);
    noStroke()
    textSize(Math.floor(keysize/2));
    fill("#000000");
    text("Delete", startx+(1.5)*keysize, starty+(4.5)*keysize + keysize/2/2.8);
    stroke(0)
    fill("#FFFFFF")
    rect(startx + 3*keysize + 1, starty + 4*keysize + 1, 1.5*keysize - 2, keysize-2);
    noStroke()
    fill("#000000");
    text("Wall", startx+(3.75)*keysize, starty+(4.5)*keysize + keysize/2/2.8);
    stroke(0)
    fill("#FFFFFF")
    rect(startx + 4.5*keysize + 1, starty + 4*keysize + 1, 1.5*keysize - 2, keysize-2);
    noStroke()
    fill("#000000");
    text("Bar", startx+(5.25)*keysize, starty+(4.5)*keysize + keysize/2/2.8);
    stroke(0)
    fill("#FFFFFF")
    rect(startx + 6*keysize + 1, starty + 4*keysize + 1, 1.5*keysize - 2, keysize-2);
    noStroke()
    fill("#000000");
    text("Undo", startx+(6.75)*keysize, starty+(4.5)*keysize + keysize/2/2.8);
    stroke(0)
    fill("#FFFFFF")
    rect(startx + 7.5*keysize + 1, starty + 4*keysize + 1, 1.5*keysize - 2, keysize-2);
    noStroke()
    fill("#000000");
    text("Redo", startx+(8.25)*keysize, starty+(4.5)*keysize + keysize/2/2.8);
  }
  for (x=0;x<9;x++) {
    if (clickchecker) {5
      if (mouseX > startx + x*keysize && mouseX < startx + (x+1)*keysize && mouseY > starty + 5*keysize && mouseY < starty + 6*keysize) {
        updateundo()
        if (x<6) {
          gridobjectdata.stored[gridobjectdata.selectposition[0]][gridobjectdata.selectposition[1]].shading = x
          if (x==0) {
            gridobjectdata.stored[gridobjectdata.selectposition[0]][gridobjectdata.selectposition[1]].shape = "none"
          }
        } else if (x==6) {
          gridobjectdata.stored[gridobjectdata.selectposition[0]][gridobjectdata.selectposition[1]].shape = "circle"
        } else if (x==7) {
          gridobjectdata.stored[gridobjectdata.selectposition[0]][gridobjectdata.selectposition[1]].shape = "square"
        } else if (x==8) {
          gridobjectdata.stored[gridobjectdata.selectposition[0]][gridobjectdata.selectposition[1]].shape = "hexagon"
        }
      }
    } else {
      if (x<6) {
        stroke(0)
        fill(shadecolours[x])
        rect(startx + x*keysize + 1, starty + 5*keysize + 1, keysize - 2);
        if (setting.colourblind && x>1) {
          textSize(Math.floor(keysize/1.9)*0.4)
          let symbol = shadesymbols[x]
          fill("#000000");
          noStroke()
          text(symbol, startx + (x+0.87)*keysize, starty + 5.91*keysize + 1);
        }
      } else if (x == 6) {
        stroke(0)
        strokeWeight(widthallowed/243)
        fill(colourscheme.cellfill)
        rect(startx + x*keysize + 1, starty + 5*keysize + 1, keysize - 2);
        drawshape(startx + 6.5*keysize, starty + 5.5*keysize, 0.8*keysize - 2, colourscheme.cellshadow, 2, "circle")
      } else if (x == 7){
        stroke(0)
        strokeWeight(widthallowed/243)
        fill(colourscheme.cellfill)
        rect(startx + x*keysize + 1, starty + 5*keysize + 1, keysize - 2);
        drawshape(startx + (x+0.1)*keysize + 1, starty + 5.1*keysize + 1, 0.8*keysize - 2, colourscheme.cellshadow, 2, "square")
      } else if (x == 8){
        stroke(0)
        strokeWeight(widthallowed/243)
        fill(colourscheme.cellfill)
        rect(startx + x*keysize + 1, starty + 5*keysize + 1, keysize - 2);
        //drawshape(startx + (x+0.1)*keysize + 1, starty + 5.1*keysize + 1, 0.8*keysize - 2, colourscheme.cellshadow, 4, "triangle")
        drawshape(startx + (x+0.5)*keysize, starty + 5.5*keysize + 1, 0.8*keysize - 2, colourscheme.cellshadow, 2, "hexagon")
      }
    }
  }
}

function drawcrossgrid(startx = 0, starty = 0, endx = windowWidth / 2, endy = windowHeight) {
  noStroke()
  textAlign(CENTER);
  if ((endx - startx) / gridobjectdata.width < (endy - starty) / gridobjectdata.height) {
    gridobjectdata.cellsize = (endx - startx) / gridobjectdata.width
    gridobjectdata.truewidth = endx - startx
    gridobjectdata.trueheight = gridobjectdata.cellsize * gridobjectdata.height
  } else {
    gridobjectdata.cellsize = (endy - starty) / gridobjectdata.height
    gridobjectdata.truewidth = gridobjectdata.cellsize * gridobjectdata.width
    gridobjectdata.trueheight = endy - starty
  }
  gridobjectdata.widthend = gridobjectdata.truewidth + startx
  gridobjectdata.heightend = gridobjectdata.trueheight + starty
  let curtextsize = Math.floor(gridobjectdata.cellsize / 1.4);
  fill("#000000");
  rect(startx,starty,gridobjectdata.width * gridobjectdata.cellsize, gridobjectdata.height * gridobjectdata.cellsize)
  for (let y=0; y < gridobjectdata.height; y++) {
    for (let x=0; x < gridobjectdata.width; x++) { // cycle through square in grid
      let cellinfo = gridobjectdata.stored[x][y];
      let istrueselected = (gridobjectdata.selectposition[0] == x && gridobjectdata.selectposition[1] == y);
      let islineselected = (gridobjectdata.selectposition[2] == false && gridobjectdata.selectposition[1] == y) || (gridobjectdata.selectposition[2] == true && gridobjectdata.selectposition[0] == x);
      let symbolhighlight = false
      if (istrueselected && interfacedata.tabopen == 0) {
          fill(colourscheme.celltrueselect); // highlights for selected
      } else if (islineselected && interfacedata.tabopen == 0) {
          fill(colourscheme.celllineselect);
      } else if (cellinfo.content == "~b") {
          fill(colourscheme.cellwall);
      } else {
          fill(shadecolours[gridobjectdata.stored[x][y].shading]);
      }
      if (gridobjectdata.stored[x][y].shading > 1 && setting.colourblind) {
        symbolhighlight = true
      }
      rect(x*gridobjectdata.cellsize + 1 + startx, y*gridobjectdata.cellsize + 1 + starty, gridobjectdata.cellsize - 2);
      fill(cellinfo.content == "~b" ? colourscheme.cellwall : shadecolours[gridobjectdata.stored[x][y].shading]);
      rect((x+0.1)*gridobjectdata.cellsize + 1 + startx, (y+0.1)*gridobjectdata.cellsize + 1 + starty, gridobjectdata.cellsize*0.8 - 2);
      if (gridobjectdata.stored[x][y].shape != "none") {
        if (gridobjectdata.stored[x][y].shape == "square") {
          drawshape((x+0.1)*gridobjectdata.cellsize + 1 + startx, (y+0.1)*gridobjectdata.cellsize + 1 + starty, 0.8*gridobjectdata.cellsize - 2, colourscheme.cellshadow, 4, "square")
        } else {
          drawshape((x+0.5)*gridobjectdata.cellsize + startx, (y+0.5)*gridobjectdata.cellsize + starty, 0.8*gridobjectdata.cellsize - 2, colourscheme.cellshadow, 4, gridobjectdata.stored[x][y].shape)
        }
      }
      noStroke()
      if (isAlphanumeric(cellinfo.content)) {
        textSize(curtextsize);
        fill("#000000");
        if (interfacedata.tabopen != 5) {
          text(cellinfo.content, (x+0.5)*gridobjectdata.cellsize + startx, (y+0.5)*gridobjectdata.cellsize + curtextsize/2.8 + starty);
        }
      }
      if (cellinfo.startofclue[0] != 0) {
        textSize(0.3*curtextsize);
        fill("#000000");
        text(cellinfo.startofclue[0], (x+0.04+str(cellinfo.startofclue[0]).length*0.06)*gridobjectdata.cellsize + startx, (y+0.1)*gridobjectdata.cellsize + curtextsize/7 + starty);
      }
      if (cellinfo.barredx && cellinfo.content != "~b") {
        fill(colourscheme.cellwall);
        rect((x+0.85)*gridobjectdata.cellsize + startx, y*gridobjectdata.cellsize + starty, 0.15*gridobjectdata.cellsize, gridobjectdata.cellsize);
      }
      if (cellinfo.barredy && cellinfo.content != "~b") {
        fill(colourscheme.cellwall);
        rect(x*gridobjectdata.cellsize + startx -1, (y+0.85)*gridobjectdata.cellsize + starty, gridobjectdata.cellsize, 0.15*gridobjectdata.cellsize);
      }
      if (symbolhighlight && cellinfo.content != "~b") {
        symbol = shadesymbols[gridobjectdata.stored[x][y].shading]
        textSize(0.3*curtextsize);
        if (cellinfo.barredx || cellinfo.barredy) {fill("#FFFFFF");} else {fill("#000000");};
        text(symbol, (x+0.97-str(symbol).length*0.06)*gridobjectdata.cellsize + startx, (y+1.07)*gridobjectdata.cellsize - curtextsize/7 + starty);
      }
    }
  }
}

function drawdragselection(selection) {
  if (selection[4] > 0) {
    strokeWeight(5)
    stroke("#FF00FF")
    if (selection[4] == 1) {
      drawingContext.setLineDash([5,10]);
      let seconds = (new Date() / 1000) % 1;
      drawingContext.lineDashOffset = seconds*30;
    }
    noFill()
    if (selection[0] < selection[2]) {
      if (selection[1] < selection[3]) {
        rect(gridobjectdata.cellsize*(selection[0])+1,gridobjectdata.cellsize*(selection[1])+1, gridobjectdata.cellsize*(selection[2]-selection[0]+1)-2, gridobjectdata.cellsize*(selection[3]-selection[1]+1)-2)
      } else {
        rect(gridobjectdata.cellsize*(selection[0])+1,gridobjectdata.cellsize*(selection[3])+1, gridobjectdata.cellsize*(selection[2]-selection[0]+1)-2, gridobjectdata.cellsize*(selection[1]-selection[3]+1)-2)
      }
    } else {
      if (selection[1] < selection[3]) {
        rect(gridobjectdata.cellsize*(selection[2])+1,gridobjectdata.cellsize*(selection[1])+1, gridobjectdata.cellsize*(selection[0]-selection[2]+1)-2, gridobjectdata.cellsize*(selection[3]-selection[1]+1)-2)
      } else {
        rect(gridobjectdata.cellsize*(selection[2])+1,gridobjectdata.cellsize*(selection[3])+1, gridobjectdata.cellsize*(selection[0]-selection[2]+1)-2, gridobjectdata.cellsize*(selection[1]-selection[3]+1)-2)
      }
    }
    strokeWeight(1)
    drawingContext.setLineDash([1])
  }
}

function cluestabinit() {
  gridobjectdata.selectdrag[4] = 0;
  for (let i = 0; i < gridobjectdata.fullwords.length; i++) {
    if (gridobjectdata.fullwords[i].length > 3) {
      gridobjectdata.fullwords[i][3] = ""
    }
    gridobjectdata.fullwords[i].push(gridobjectdata.fullwords[i][2])
    let broken = false
    for (let j = 0; j < interfacedata.assignedclues.length; j++) {
      if (interfacedata.assignedclues[j][0] == gridobjectdata.fullwords[i][2] && arraysEqual(interfacedata.assignedclues[j][2],gridobjectdata.fullwords[i][1])) {  
        gridobjectdata.fullwords[i][3] = createInput(interfacedata.assignedclues[j][1])
        broken = true;
        break;
      } 
    }
    if (!broken) {
      gridobjectdata.fullwords[i][3] = createInput('')
    }
    gridobjectdata.fullwords[i][3].attribute('placeholder', 'Enter clue here')
  }
}

function drawcluestab(startx, starty, widthallowed) {
  if (widthallowed < 450) {
    textSize(widthallowed/15)
  } else {
    textSize(30)
  }
  textAlign(LEFT);
  fill(colourscheme.cellwall)
  for (let i = 0; i < gridobjectdata.fullwords.length; i++) {
    let ypos = 80*i+starty+5-interfacedata.scrolledclues
    if (ypos > -8 && ypos < windowHeight) {
      gridobjectdata.fullwords[i][3].position(startx + 5, ypos+40)
    } else {
      gridobjectdata.fullwords[i][3].position(10000,10000)
    }
    text(gridobjectdata.fullwords[i][0] +")", startx + 5, ypos+22)
    text(gridobjectdata.fullwords[i][2], startx + 5 + textWidth(gridobjectdata.fullwords[i][0] +")"), ypos+22)
    gridobjectdata.fullwords[i][3].size(widthallowed-14,20)
  }
  if (gridobjectdata.fullwords.length == 0 && interfacedata.assignedclues.length == 0) {
    textAlign(LEFT, TOP)
    textSize(widthallowed/20)
    text("No complete words found! Fill in the grid on the left first.", startx + 5, starty+5, widthallowed- 10)
  }
}

function cluestabclose() {
  for (let i = 0; i < gridobjectdata.fullwords.length; i++) {
    broken = false
    for (let j = 0; j < interfacedata.assignedclues.length; j++) {
      if (interfacedata.assignedclues[j][0] == gridobjectdata.fullwords[i][2] && arraysEqual(interfacedata.assignedclues[j][2],gridobjectdata.fullwords[i][1])) {
        interfacedata.assignedclues[j] = [gridobjectdata.fullwords[i][2], gridobjectdata.fullwords[i][3].value(), gridobjectdata.fullwords[i][1],gridobjectdata.fullwords[i][0]]
        broken = true;
        break;
      }
    }
    if (!broken) {
      interfacedata.assignedclues.push([gridobjectdata.fullwords[i][2], gridobjectdata.fullwords[i][3].value(), gridobjectdata.fullwords[i][1],gridobjectdata.fullwords[i][0]])
    }
    if (gridobjectdata.fullwords[i].length > 3) {
      gridobjectdata.fullwords[i][3].remove()
      gridobjectdata.fullwords[i].splice(3,1)
    }
  }
  for (let j = interfacedata.assignedclues.length-1; j >= 0; j--) {
    if (interfacedata.assignedclues[j][1] == "") {
      let broken = false
      for (let i = 0; i < gridobjectdata.fullwords.length; i++) {
        if (interfacedata.assignedclues[j][0] == gridobjectdata.fullwords[i][2] && arraysEqual(interfacedata.assignedclues[j][2],gridobjectdata.fullwords[i][1])) {
          broken = true
          break;
        }
      }
      if (!broken) {
        interfacedata.assignedclues.splice(j,1)
      }
    }
  }
  console.log(interfacedata.assignedclues)
  console.log(gridobjectdata.fullwords)
}

function drawtoggle(startx, starty, width, height, state) {
  strokeWeight(height/16)
  if (state) {
    fill("#22FF22")
  } else {
    fill("#FF2222")
  }
  stroke(0)
  rectMode(CORNER)
  rect(startx, starty, width, height)
  if (state) {
    line(startx+width/3,starty+height, startx+width, starty)
    line(startx+width/3,starty+height, startx, starty+height/2)
  } else {
    line(startx,starty, startx+width, starty+height)
    line(startx+width,starty, startx, starty+height)
  }
}
function togglemustconnect() {
  gendata.mustconnect = !gendata.mustconnect
}
function toggleusecurgrid() {
  gendata.usecurgrid = !gendata.usecurgrid
}
function toggleusebars() {
  gendata.usebars = !gendata.usebars
}
function togglewallfill() {
  gendata.wallfill = !gendata.wallfill
}
function genundo() {
  if (gendata.undolength > 0) {
    unredo(0)
    gendata.undolength -= 1
  }
}
function removegenwords() {
  for (let i = interfacedata.generatorwords[0]; i > 0; i--) {
    interfacedata.generatorwords[i][0].remove()
    interfacedata.generatorwords.pop()
  }
  interfacedata.generatorwords[0] = 1
  interfacedata.generatorwords.push([null, ""])
  interfacedata.generatorwords[1][0] = createInput()
  interfacedata.generatorwords[1][0].attribute('placeholder', 'Enter word here')
}

function gentabinit() {
  gridobjectdata.selectdrag[4] = 0;
  for (let i = 0; i < interfacedata.generatorwords[0]; i++) {
    interfacedata.generatorwords[i+1][0] = createInput(interfacedata.generatorwords[i+1][1])
    interfacedata.generatorwords[i+1][0].attribute('placeholder', 'Enter word here')
  }
}

function drawgenprogress(startx, starty, widthallowed, message) {
  textSize(widthallowed/25)
  drawwrappedtext(message,startx,starty,widthallowed-6)
}

function drawgentab(startx, starty, widthallowed) {
  textSize(widthallowed/25)
  textAlign(LEFT);
  fill(colourscheme.cellwall)
  let ydisp = -interfacedata.scrolledgen + widthallowed/25
  desctext = "This is the crossword generator, it takes input words and creates a crossword grid out of them! This may take some time, and may clear the current grid."
  text(desctext, startx+5, starty+ydisp, widthallowed-10)
  ydisp += textHeight(desctext,widthallowed-10)-5
  drawtoggle(startx+10, starty+ydisp, widthallowed/12, widthallowed/12, gendata.mustconnect)
  interfacedata.buttons.genmustconnect = {x:startx+10, y:starty+ydisp, dx:startx+widthallowed/12+10, dy:starty+ydisp+widthallowed/12, func: togglemustconnect}
  fill("#000000")
  noStroke()
  text("Crossword must fully connect", startx+15+widthallowed/12, starty+ydisp+widthallowed/24+5)
  ydisp += widthallowed/12 + 10
  drawtoggle(startx+10, starty+ydisp, widthallowed/12, widthallowed/12, gendata.usecurgrid)
  interfacedata.buttons.gencurgrid = {x:startx+10, y:starty+ydisp, dx:startx+widthallowed/12+10, dy:starty+ydisp+widthallowed/12, func: toggleusecurgrid}
  fill("#000000")
  noStroke()
  text("Generate based on current grid", startx+15+widthallowed/12, starty+ydisp+widthallowed/24+5)
  ydisp += widthallowed/12 + 10
  drawtoggle(startx+10, starty+ydisp, widthallowed/12, widthallowed/12, gendata.wallfill)
  interfacedata.buttons.genwallfill = {x:startx+10, y:starty+ydisp, dx:startx+widthallowed/12+10, dy:starty+ydisp+widthallowed/12, func: togglewallfill}
  fill("#000000")
  noStroke()
  text("Replace empty space with walls", startx+15+widthallowed/12, starty+ydisp+widthallowed/24+5)
  ydisp += widthallowed/12 + 16
  /*drawtoggle(startx+10, starty+ydisp, widthallowed/12, widthallowed/12, gendata.usebars)
  interfacedata.buttons.genusebars = {x:startx+10, y:starty+ydisp, dx:startx+10+widthallowed/12, dy:starty+ydisp+widthallowed/12, func: toggleusebars}
  fill("#000000")
  noStroke()
  text("Crossword may use bars to separate cells", startx+15+widthallowed/12, starty+ydisp+widthallowed/24+5)
  ydisp += widthallowed/12 + 10*/
  fill("#F0E0FF")
  strokeWeight(widthallowed/192)
  stroke(0)
  let xdisp = startx
  if (!gendata.history[1] && !gendata.generating) {
    rect(startx+10, starty+ydisp-5, widthallowed/5.5, widthallowed/20)
    fill("#000000")
    noStroke()
    text("Generate!", startx + 10 + widthallowed/200, starty+ydisp+(widthallowed/24)-5)
    interfacedata.buttons.generate = {x:startx+10, y:starty+ydisp-5, dx:startx+widthallowed/5.5+10, dy:starty+ydisp+widthallowed/20-5, func: generatecrosswordinit}
    xdisp += widthallowed/5.5+10+widthallowed/100
  } else if (!gendata.generating) {
    rect(startx+10, starty+ydisp-5, textWidth("Continue Generating")+widthallowed/100, widthallowed/20)
    fill("#000000")
    noStroke()
    text("Continue Generating", startx + 10 + widthallowed/200, starty+ydisp+(widthallowed/24)-5)
    interfacedata.buttons.generate = {x:startx+10, y:starty+ydisp-5, dx:startx+textWidth("Continue Generating")+widthallowed/100+10, dy:starty+ydisp+widthallowed/20-5, func: generatecrosswordinit}
    xdisp += textWidth("Continue Generating")+5*widthallowed/100
  }
  if (!gendata.generating) {
    fill("#D0E0DF")
    stroke(0)
    rect(xdisp+widthallowed/100, starty+ydisp-5, textWidth("Revert Grid")+widthallowed/100, widthallowed/20)
    fill("#000000")
    noStroke()
    text("Revert Grid", xdisp + 3*widthallowed/200, starty+ydisp+(widthallowed/24)-5)
    interfacedata.buttons.genundo = {x:xdisp+widthallowed/100, y:starty+ydisp-5, dx:xdisp+textWidth("Revert Grid")+widthallowed/50, dy:starty+ydisp+widthallowed/20-5, func: genundo}
    xdisp += textWidth("Revert Grid")+widthallowed/25
    fill("#D0E0DF")
    stroke(0)
    rect(xdisp, starty+ydisp-5, textWidth("Clear Words")+widthallowed/100, widthallowed/20)
    fill("#000000")
    noStroke()
    text("Clear Words", xdisp + widthallowed/200, starty+ydisp+(widthallowed/24)-5)
    interfacedata.buttons.genclear = {x:xdisp, y:starty+ydisp-5, dx:xdisp+textWidth("Clear Words")+widthallowed/100, dy:starty+ydisp+widthallowed/20-5, func: removegenwords}
  }
  fill("#000000")
  noStroke()
  if (gendata.generating) {
    drawgenprogress(startx+5, starty+ydisp, widthallowed-10, interfacedata.errornotice)
    interfacedata.errornotice = ""
  }
  ydisp += 3 + widthallowed/12
  if (!gendata.generating && interfacedata.errornotice != "") {
    drawgenprogress(startx+5, starty+ydisp, widthallowed-10, interfacedata.errornotice)
  }
  ydisp += widthallowed/12
  textSize(widthallowed/25)
  fill("#000000")
  text("Generator words:", startx+5, starty+ydisp, widthallowed-10)
  ydisp += widthallowed/36
  for (let i = 1; i <= interfacedata.generatorwords[0]; i++) {
    let ypos = 40*(i-1)+starty+ydisp
    if (ypos > 36 && ypos < windowHeight) {
      interfacedata.generatorwords[i][0].position(startx + 5, ypos)
    } else {
      interfacedata.generatorwords[i][0].position(10000,10000)
    }
    interfacedata.generatorwords[i][0].size(widthallowed-14,20)
    interfacedata.generatorwords[i][1] = interfacedata.generatorwords[i][0].value()
    if (i == interfacedata.generatorwords[0]) {
      if (interfacedata.generatorwords[i][1] != "") {
        interfacedata.generatorwords.push([null, ""])
        interfacedata.generatorwords[i+1][0] = createInput()
        interfacedata.generatorwords[i+1][0].attribute('placeholder', 'Enter word here')
        interfacedata.generatorwords[0] += 1
      }
    } else if (interfacedata.generatorwords[i][1] == "") {
      interfacedata.generatorwords[i][0].remove()
      interfacedata.generatorwords.splice(i, 1)
      interfacedata.generatorwords[0] -= 1
    }
  }
}

function gentabclose() {
  if (interfacedata.generatorwords[1][0] != null) {
    for (let i = 1; i < interfacedata.generatorwords.length; i++) {
      interfacedata.generatorwords[i][0].remove()
    }
  }
  for (let button in interfacedata.buttons) {
    if (button.slice(0,3) == "gen") {
      delete interfacedata.buttons[button]
    }
  }
  gendata.history[1] = false
}

function wordfitinposition(position, word, grid, order) {
  let x = position[0]
  let y = position[1]
  let height = grid.length
  let width = grid[0].length
  let works = true
  //let fits = false
  if (position[2]) {
    for (let i = 0; i < word.length; i++) { // match word's letters down
      let posletter = grid[y+i][x][0]
      if (!(posletter == "~" || posletter == word[i])) {
        works = false
        break
      }
      //if (posletter == word[i]) {
        //fits = true
      //}
    }
    //if (!fits) {
      //works = false
    //}
    if (y > 0) {
      if (grid[y-1][x][0] != "~") { // above is empty
        works = false
      }
    }
    if (y < height-word.length) {
      if (grid[y+word.length][x][0] != "~") { // below is empty
        works = false
      }
    }
    if (x > 0) {
      for (let i = 0; i < word.length; i++) { // leftwards
        let posletter = grid[y+i][x-1]
        if (posletter[0] != "~" && posletter[1] && ((posletter[3][0] && !posletter[2][0]) || posletter[2][2])) { // if left also down or end of word
          works = false
          break
        }
      }
    }
    if (x < width-1) {
      for (let i = 0; i < word.length; i++) {
        let posletter = grid[y+i][x+1]
        if (posletter[0] != "~" && posletter[1] && ((posletter[3][0] && !posletter[2][0]) || posletter[2][1])) {
          works = false
          break
        }
      }
    }
  } else {
    for (let i = 0; i < word.length; i++) {
      let posletter = grid[y][x+i][0]
      if (!(posletter == "~" || posletter == word[i])) {
        works = false
        break
      }
      //if (posletter == word[i]) {
        //fits = true
      //}
    }
    //if (!fits) {
      //works = false
    //}
    if (x > 0) {
      if (grid[y][x-1][0] != "~") {
        works = false
      }
    }
    if (x < width-word.length) {
      if (grid[y][x+word.length][0] != "~") {
        works = false
      }
    }
    if (y > 0) {
      for (let i = 0; i < word.length; i++) {
        let posletter = grid[y-1][x+i]
        if (posletter[0] != "~" && posletter[1] && ((posletter[2][0] && !posletter[3][0]) || posletter[3][2])) {
          works = false
          break
        }
      }
    }
    if (y < height-1) {
      for (let i = 0; i < word.length; i++) {
        let posletter = grid[y+1][x+i]
        if (posletter[0] != "~" && posletter[1] && ((posletter[2][0] && !posletter[3][0]) || posletter[3][1])) {
          works = false
          break
        }
      }
    }
  }
  return works
}

function wordfitallposition(word, grid, positions, attempted, totals, order) {
  let i = attempted-1
  let repeatagain = true
  while (repeatagain) {
    i++
    if (i >= totals) {
      repeatagain = false
      break
    } 
    fitresult = wordfitinposition(positions[i], word, grid, order)
    repeatagain = !fitresult
  }
  return [i, i>=totals]
}

function gridinsertion(word, position, grid, index) { // put the word in the grid temp
  let x = position[0]
  let y = position[1]
  if (position[2]) {
    for (let i = 0; i < word.length; i++) {
      let temp = structuredClone(grid[y+i][x][2])
      grid[y+i][x] = [word[i], true, temp, [true, i==0, i == word.length-1]]
    }
  } else {
    for (let i = 0; i < word.length; i++) {
      let temp = structuredClone(grid[y][x+i][3])
      grid[y][x+i] = [word[i], true, [true, i==0, i == word.length-1], temp]
    }
  }
  return grid
}

function connectedgrid(grid, width, height) {
  let checkedgrid = []
  let pushline = []
  for (let a = 0; a < width; a++) {
    pushline.push("u")
  }
  for (let a = 0; a < height; a++) {
    checkedgrid.push(structuredClone(pushline))
  }
  let found = false
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x][0] != "~") {
        found = true
        checkedgrid[y][x] = "c"
        break
      }
    }
    if (found) {
      break
    }
  }
  let foundany = true
  while (foundany) {
    foundany = false
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid[y][x][0] != "~") {
          if (checkedgrid[y][x] == "u") {
            if (x>0) {
              if (checkedgrid[y][x-1] == "c") {
                checkedgrid[y][x] = "c"
                foundany = true
              }
            }
            if (x<width-1) {
              if (checkedgrid[y][x+1] == "c") {
                checkedgrid[y][x] = "c"
                foundany = true
              }
            }
            if (y>0) {
              if (checkedgrid[y-1][x] == "c") {
                checkedgrid[y][x] = "c"
                foundany = true
              }
            }
            if (y<height-1) {
              if (checkedgrid[y+1][x] == "c") {
                checkedgrid[y][x] = "c"
                foundany = true
              }
            }
          }
        } else {
          checkedgrid[y][x] = "b"
        }
      }
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (checkedgrid[y][x] == "u") {
        return false
      }
    }
  }
  return true
}

function findintersects(grid, width, height) {
  let numinter = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x][0] != "~") {
        let xinter = false
        let yinter = false
        if (x>0) {
          if (grid[y][x-1][0] != "~") {
            xinter = true
          } 
        }
        if (x<width-1) {
          if (grid[y][x+1][0] != "~") {
            xinter = true
          } 
        }
        if (y>0) {
          if (grid[y-1][x][0] != "~") {
            yinter = true
          } 
        }
        if (y<height-1) {
          if (grid[y+1][x][0] != "~") {
            yinter = true
          } 
        }
        if (xinter && yinter) {
          numinter += 1
        }
      }
    }
  }
  return numinter
}

function gendefinepositionsdefault() {
  let unsolvable = false
  let existinglengths = []
  for (let i = 0; i < gendata.cluewords.length; i++) {
    interfacedata.errornotice = "Defining positions: " + str(round(100*i/gendata.cluewords.length) + "%")
    if (gendata.cluewords[i].length > gendata.gridsize && gendata.cluewords[i].length > gendata.gridsize) {
      unsolvable = true
      break
    }
    gendata.triedcombos.push(0)
    gendata.pastgrids.push(null)
    gendata.totalcombos.push((gendata.gridsize+1-gendata.cluewords[i].length) * gendata.gridsize + (gendata.gridsize+1-gendata.cluewords[i].length) * gendata.gridsize)
    if (existinglengths.includes(gendata.cluewords[i].length)) {
      let combs = structuredClone(gendata.combforeach[existinglengths.findIndex(len => len == gendata.cluewords[i].length)])
      shufflearray(combs)
      gendata.combforeach.push(combs)
    } else {
      let combs = []
      for (let a = 0; a < (gendata.gridsize+1-gendata.cluewords[i].length); a++) {
        for (let b = 0; b < gendata.gridsize; b++) {
          combs.push([a, b, false])
        }
      }
      for (let a = 0; a < (gendata.gridsize+1-gendata.cluewords[i].length); a++) {
        for (let b = 0; b < gendata.gridsize; b++) {
          combs.push([b, a, true])
        }
      }
      shufflearray(combs) // so the grid isnt so across + topleft heavy, remove bias
      gendata.combforeach.push(combs)
    }
    existinglengths.push(gendata.cluewords[i].length)
  }
}
function gendefinepositionscurgrid(curgrid) {
  let unsolvable = false
  for (let i = 0; i < gendata.cluewords.length; i++) {
    interfacedata.errornotice = "Defining positions: " + str(round(100*i/gendata.cluewords.length) + "%")
    if (gendata.cluewords[i].length > gendata.gridsize && gendata.cluewords[i].length > gendata.gridsize) {
      unsolvable = true
      break
    }
    gendata.triedcombos.push(0)
    gendata.pastgrids.push(null)
    let combs = []
    for (let a = 0; a < (gendata.gridsize+1-gendata.cluewords[i].length); a++) {
      for (let b = 0; b < gendata.gridsize; b++) {
        let fitsin = true
        for (let x = 0; x < gendata.cluewords[i].length; x++) {
          if (!(curgrid[a+x][b].content == "~e" || curgrid[a+x][b].content == gendata.cluewords[i][x].toUpperCase()) || curgrid[a+x][b].content == "~b" || (curgrid[a+x][b].barredx && x != gendata.cluewords[i].length-1)) {
            fitsin = false
            break
          }
        }
        if (fitsin) {
          combs.push([a, b, false])
        }
      }
    }
    for (let a = 0; a < (gendata.gridsize+1-gendata.cluewords[i].length); a++) {
      for (let b = 0; b < gendata.gridsize; b++) {
        let fitsin = true
        for (let x = 0; x < gendata.cluewords[i].length; x++) {
          if (!(curgrid[b][a+x].content == "~e" || curgrid[b][a+x].content == gendata.cluewords[i][x]) || curgrid[b][a+x].content == "~b" || (curgrid[b][a+x].barredy && x != gendata.cluewords[i].length-1)) {
            fitsin = false
            break
          }
        }
        if (fitsin) {
          combs.push([b, a, true])
        }
      }
    }
    shufflearray(combs) // so the grid isnt so across + topleft heavy, remove bias
    gendata.combforeach.push(combs)
    gendata.totalcombos.push(combs.length)
  }
}

function generatecrosswordinit() {
  if (!gendata.generating) {
    if (gendata.usecurgrid && gridobjectdata.width != gridobjectdata.height) {
      interfacedata.errornotice = "Cannot generate with a non-square grid"
      return
    }
    gendata.generating = true
    gendata.starttime = Date.now()/1000
  }
}

function generatecrossword() {
  gendata.cluewords = []
  for (let i = 1; i < interfacedata.generatorwords.length-1; i++) {
    let word = interfacedata.generatorwords[i][1].replace(/[^A-Z\d]/gi, '')
    if (word.length > 1) {
      gendata.cluewords.push(word.toUpperCase())
    }
  }
  if (gendata.cluewords.length < 1) {
    interfacedata.errornotice = "No generator words are inputted"
    gendata.generating = false
    return
  }
  gendata.cluewords.sort((a, b) => b.length - a.length);
  if (!arraysEqual(gendata.cluewords, gendata.history[0])) {
    gendata.gridsize = int(gendata.cluewords[0].length)
    gendata.starttime = Date.now()/1000
    gendata.progression = 1
    gendata.history[0] = structuredClone(gendata.cluewords)
  }
  if (!gendata.history[1]) {
    gendata.gridsize = int(gendata.cluewords[0].length)
    gendata.progression = 1
    gendata.starttime = Date.now()/1000
    gendata.history[1] = true
  }
  let processtime = Date.now()/1000
  let expandinggrid = true
  while (expandinggrid) {
    if (gendata.progression == 1) {
      gendata.triedcombos = [] // which part of gendata.combforeach it has cycled through
      gendata.totalcombos = [] // max number per word of gendata.combforeach (its length)
      gendata.combforeach = [] // all combinations of word placements
      gendata.pastgrids = [null]
      if (gendata.usecurgrid) {
        gendata.gridsize = int(gridobjectdata.width)
        gendefinepositionscurgrid(gridobjectdata.stored)
        expandinggrid = false
      } else {
        gendefinepositionsdefault()
      }
      console.log(gendata.combforeach)
      console.log(gendata.totalcombos)
      for (let x = 0; x < gendata.totalcombos.length; x++) {
        if (gendata.totalcombos[x] == 0) {
          interfacedata.errornotice = "No grid found"
          gendata.generating = false
          gendata.progression = 0
          gendata.history[1] = false
          return
        }
      }
      gendata.progression = 2
    }
    let complexity = Array(gendata.totalcombos.length)
    complexity[gendata.totalcombos.length-1] = 1
    for (let i = gendata.totalcombos.length-2; i >= 0; i--) {
      complexity[i] = gendata.totalcombos[i+1] * complexity[i+1]
    }
    let totalcomplexity = complexity[0] * gendata.totalcombos[0]
    let prevpercent = 0
    if (gendata.progression == 2) {
      grid = [] // temporary fit in grid
      let pushline = []
      for (let j = 0; j < gendata.gridsize; j++) {
        pushline.push(["~", false, [false, false, false], [false, false, false]]) // content, assigned? [part of across, start, end] [part of down, start, end]
      }
      for (let i = 0; i < gendata.gridsize; i++) {
        grid.push(structuredClone(pushline))
      }
      gendata.pastgrids[0] = structuredClone(grid)
      gendata.progression = 3
    } else {
      grid = structuredClone(gendata.pastgrids[gendata.pastgrids.length-1])
    }
    if (gendata.progression == 3) {
      let unsolved = true
      gendata.focusindex = 0
      solvedgrids = []
      solvedvalues = []
      while (unsolved) {
        newfix = wordfitallposition(gendata.cluewords[gendata.focusindex], grid, gendata.combforeach[gendata.focusindex], gendata.triedcombos[gendata.focusindex], gendata.totalcombos[gendata.focusindex], gendata.focusindex)
        let thiscomplexity = 0
        for (let i = 0; i < complexity.length; i++) (
          thiscomplexity += complexity[i] * gendata.triedcombos[i]
        )
        if (Math.floor(100*thiscomplexity/totalcomplexity) > prevpercent) {
          prevpercent = Math.floor(100*thiscomplexity/totalcomplexity)
        }
        if (newfix[1]) { // if exhausted all options for that word
          gendata.triedcombos[gendata.focusindex] = 9999999999
        } else {
          grid = gridinsertion(gendata.cluewords[gendata.focusindex], gendata.combforeach[gendata.focusindex][newfix[0]], grid, gendata.focusindex)
          gendata.triedcombos[gendata.focusindex] = newfix[0]
          if (gendata.focusindex == gendata.cluewords.length-1) {
            if (connectedgrid(grid,gendata.gridsize,gendata.gridsize) || !gendata.mustconnect) { // if all interlinked
              solvedgrids.push(structuredClone(grid))
              let value = findintersects(grid,gendata.gridsize,gendata.gridsize) //- 0.1*findbars(grid,gendata.gridsize)
              solvedvalues.push(value)
              expandinggrid = false
              if (value == gendata.cluewords.length || thiscomplexity > 10000000000) {
                gendata.progression = 0
                gendata.generating = false
                unsolved = false
              }
            }
            gendata.triedcombos[gendata.focusindex] += 1
            grid = structuredClone(gendata.pastgrids[gendata.focusindex])
          } else {
            gendata.focusindex += 1
            for (let gridid = gendata.pastgrids.length-1; gridid >= gendata.focusindex; gridid--) {
              gendata.pastgrids.pop(gridid)
            }
            gendata.pastgrids.push(structuredClone(grid))
          }
        }
        for (let ind = gendata.cluewords.length-1; ind >= 0; ind--) {
          if (gendata.triedcombos[ind] >= gendata.totalcombos[ind]) {
            if (ind == 0) {
              unsolved = false
              if (gendata.usecurgrid) {
                interfacedata.errornotice = "No grid found"
                gendata.generating = false
                gendata.progression = 0
                gendata.history[1] = false
              }
              break
            } else {
              gendata.triedcombos[ind-1] += 1
              gendata.focusindex = ind-1
              for (let j = ind; j < gendata.cluewords.length; j++) {
                gendata.triedcombos[j] = 0
              }
              grid = structuredClone(gendata.pastgrids[ind-1])
            }
          }
        }
        for (let gridid = gendata.focusindex+1; gridid < gendata.pastgrids.length; gridid++) {
          gendata.pastgrids.pop()
        }
        if (Date.now()/1000 > gendata.starttime + 15) {
          unsolved = false
          expandinggrid = false
          gendata.generating = false
          interfacedata.errornotice = "Generator timed out after 15s"
          break
        }
        if (Date.now()/1000 > processtime + 0.5) {
          expandinggrid = false
          interfacedata.errornotice = "Testing combos: " + str(gendata.gridsize) + ":" + str(round(100*thiscomplexity/totalcomplexity) + "%")
          break
        }
      }
      if (expandinggrid && !unsolved) {
        gendata.gridsize += 1
        gendata.progression = 1
        if (gendata.gridsize > 15) {
          gendata.gridsize = 15
          gendata.progression = 0
          gendata.history[1] = false
          interfacedata.errornotice = "No crossgrid found"
          break
        }
      }
    }
  }
  if (solvedgrids.length > 0) {
    interfacedata.errornotice = "Grid found!"
    gendata.history[1] = false
    grid = structuredClone(solvedgrids[indexOfMax(solvedvalues)[0]])
    gridobjectdata.width = gendata.gridsize
    gridobjectdata.height = gendata.gridsize // apply new grid into the official gridobjectdata
    gendata.generating = false
    if (true) {
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
          let value = grid[y][x][0]
          if (value == "~") {
            if (gendata.usecurgrid) {
              if (gridobjectdata.stored[x][y].content != "~e") {
                value = gridobjectdata.stored[x][y].content
              }
            } else if (!gendata.wallfill) {
              value = "~e"
            } else {
              value = "~b"
            } 
          } else {
            value = value.toUpperCase()
          }
          gridobjectdata.stored[x][y].content = value
        }
      }
    }
    interfacedata.attris.width = createInput(gendata.gridsize, "number")
    interfacedata.attris.height = createInput(gendata.gridsize, "number")
    updateundo()
    gendata.undolength += 1
  }
}

function drawattributetab(startx, starty, widthallowed) {
  textSize(widthallowed/15)
  textAlign(LEFT,TOP)
  fill("#000000")
  let maxtextwidth = textWidth("Grid height: ")
  text("Grid width: ", startx+5, starty+7)
  interfacedata.attris.width.position(startx + 5 + maxtextwidth, starty + 5);
  interfacedata.attris.width.removeAttribute("disabled");
  interfacedata.attris.width.size(min(100,windowWidth-(startx + 5 + maxtextwidth)), textLeading());
  interfacedata.attris.width.style('font-size', str(textSize())+"px");
  if (interfacedata.attris.width.value() != gridobjectdata.width) {
    if (interfacedata.attris.width.value() < 26 && interfacedata.attris.width.value() > 2) {
      gridobjectdata.width = interfacedata.attris.width.value();
    } else if (interfacedata.attris.width.value() < 0) {
      interfacedata.attris.width.value(0)
    }
  }
  text("Grid height: ", startx+5, starty+7 + 1.5*textLeading())
  interfacedata.attris.height.position(startx + 5 + maxtextwidth, starty + 5 + 1.5*textLeading());
  interfacedata.attris.height.removeAttribute("disabled");
  interfacedata.attris.height.size(min(100,windowWidth-(startx + 5 + maxtextwidth)), textLeading());
  interfacedata.attris.height.style('font-size', str(textSize())+"px");
  if (interfacedata.attris.height.value() != gridobjectdata.height) {
    if (interfacedata.attris.height.value() < 26 && interfacedata.attris.height.value() > 2) {
      gridobjectdata.height = interfacedata.attris.height.value();
    }
  }
  /*
  interfacedata.attris.name.position(startx + 5, 120);
  interfacedata.attris.name.removeAttribute("disabled");
  if (interfacedata.attris.name.value() != gridobjectdata.name) {
    if (isAlphanumeric(interfacedata.attris.name.value())) {
      gridobjectdata.name = interfacedata.attris.name.value();
    }
  }
  */
}

function attributetabclose() {
  let attris = interfacedata.attris;
  let inputs = [attris.width, attris.height, attris.name, attris.desc];
  inputs.forEach(input => hidedisable(input));
}

function takescreenshot(starty,endy) {
  region = get(0, starty, windowWidth, endy);
  save(region, "xwired_grid.jpg");
}

function exportreturn() {
  interfacedata.tabopen = 4
}

function exportopen() {
  for (let y = 0; y < gridobjectdata.height; y++) {
    for (let x = 0; x < gridobjectdata.width; x++) {
      if (gridobjectdata.stored[x][y].content == "~e") {
        interfacedata.errornotice = "Unable to export: the crossgrid is not complete."
        return
      }
    }
  }
  cluestabinit()
  cluestabclose()
  if (interfacedata.assignedclues.length == 0) {
    interfacedata.errornotice = "Unable to export: not all clues have been assigned to each word in the grid."
  } else {
    for (let clue in interfacedata.assignedclues) {
      if (interfacedata.assignedclues[clue][1] == "") {
        interfacedata.errornotice = "Unable to export: not all clues have been assigned to each word in the grid."
        return
      }
    }
    interfacedata.tabopen = 5
    settingstabclose()
  }
}

function drawexportpage(unfilteredcluelist, widthallowed, heightallowed, xstart, ystart) {
  let colwidth = widthallowed
  heightallowed = heightallowed-ystart
  textAlign(CENTER,BASELINE)
  textSize(ystart/3)
  fill("#F0E0FF")
  strokeWeight(2)
  stroke(0)
  rect(windowWidth/4-ystart, ystart/2 - ystart/5, ystart*2, ystart/2.5)
  fill("#000000")
  noStroke()
  text("Download", windowWidth/4, ystart/2+ystart/8)
  interfacedata.buttons.screenshot = {x: windowWidth/4-ystart, y: ystart/2 - ystart/5, dx: ystart + windowWidth/4, dy: 7*ystart/10, func: takescreenshot, params: [ystart,ystart+heightallowed]}
  fill("#F05030")
  strokeWeight(2)
  stroke(0)
  rect(3*windowWidth/4-ystart, ystart/2 - ystart/5, ystart*2, ystart/2.5)
  fill("#000000")
  noStroke()
  text("Return", 3*windowWidth/4, ystart/2+ystart/8)
  interfacedata.buttons.exportreturn = {x: 3*windowWidth/4-ystart, y: ystart/2 - ystart/5, dx: ystart + 3*windowWidth/4, dy: 7*ystart/10, func: exportreturn}

  let cluelist = []
  for (let j = 0; j < unfilteredcluelist.length; j++) {
    for (let i = 0; i < gridobjectdata.fullwords.length; i++) {
      if (unfilteredcluelist[j][0] == gridobjectdata.fullwords[i][2] && arraysEqual(unfilteredcluelist[j][2],gridobjectdata.fullwords[i][1])) {
        cluelist.push(structuredClone(unfilteredcluelist[j]))
        break;
      }
    }
  }

  textAlign(LEFT,BASELINE)
  let textsizeused = 2*widthallowed/25
  textSize(textsizeused)
  let maxnumlen = textWidth("#".repeat(cluelist[cluelist.length-1][3].length))
  let ratio = 1
  let tryagi = true
  let iter = 0
  let aheight = 0
  let dheight = 0
  let closeness = 0.01
  while (tryagi) {
    aheight = textLeading()
    dheight = textLeading()
    for (let i = 0; i < cluelist.length; i++) {
      if (cluelist[i][2][2] == "A") {
        aheight += textHeight(cluelist[i][1], colwidth/(ratio+1))
      } else {
        dheight += textHeight(cluelist[i][1], colwidth*ratio/(ratio+1))
      }
    }
    if (false){//Math.abs(aheight-dheight)/(aheight+dheight) > closeness) {
      ratio = ratio*(1-(aheight-dheight)/(aheight+dheight))
    } else {
      tryagi = false
    }
    iter += 1
    closeness += closeness/4
    if (iter > 100) {
      tryagi = false
    }
  }
  if (max([aheight,dheight]) > heightallowed-2) {
    let scalar = Math.sqrt(Math.cbrt((heightallowed-2) / max([aheight,dheight])))
    while ((max([aheight,dheight]) > heightallowed-2)) {
      textsizeused = textsizeused * scalar
      textSize(textsizeused)
      maxnumlen = textWidth("#".repeat(cluelist[cluelist.length-1][3].length))
      aheight = textLeading()
      dheight = textLeading()
      for (let i = 0; i < cluelist.length; i++) {
        if (cluelist[i][2][2] == "A") {
          aheight += textHeight(cluelist[i][1], colwidth/(ratio+1) - 3 - maxnumlen)
        } else {
          dheight += textHeight(cluelist[i][1], colwidth*ratio/(ratio+1) - 3 - maxnumlen)
        }
      }
    }
  }
  if (textWidth("Across") > colwidth/(ratio+1)-3 || textWidth("Down") > colwidth*ratio/(ratio+1)-3) {
    let scalar = 0.97
    while (textWidth("Across") > colwidth/(ratio+1)-3 || textWidth("Down") > colwidth*ratio/(ratio+1)-3) {
      textsizeused = textsizeused * scalar
      textSize(textsizeused)
      if (textsizeused < 3) {
        break
      }
    }
  }
  fill("#000000")
  textAlign(LEFT,TOP)
  rect(xstart + colwidth/(ratio+1), ystart, 1, windowHeight)
  rect(xstart, ystart, windowWidth, 1)
  let ay = ystart + textLeading()
  let dy = ystart + textLeading()
  let acolwidth = colwidth / (ratio + 1) - 3 - maxnumlen;
  let dcolwidth = colwidth * ratio / (ratio + 1) - 3 - maxnumlen;
  text("Across", xstart+2, ystart+2)
  rect(xstart+2,ystart+textLeading()/1.2, textWidth("Across"), textsizeused/10)
  text("Down", xstart+2 + colwidth/(ratio+1), ystart+2)
  rect(xstart+2 + colwidth/(ratio+1),ystart+textLeading()/1.2, textWidth("Down"), textsizeused/10)
  //let acolwidth = 150
  //let dcolwidth = 250
  for (let i = 0; i < cluelist.length; i++) {
    if (cluelist[i][2][2] == "A") {
      text(cluelist[i][3].slice(0,-1) + ")", xstart+2, ay)
      drawwrappedtext(cluelist[i][1], xstart+maxnumlen+2, ay, acolwidth, textLeading())
      ay += textHeight(cluelist[i][1], acolwidth)
    } else {
      text(cluelist[i][3].slice(0,-1) + ")", xstart+2 + colwidth/(ratio+1), dy)
      drawwrappedtext(cluelist[i][1], xstart+maxnumlen+2 + colwidth/(ratio+1), dy, dcolwidth, textLeading())
      dy += textHeight(cluelist[i][1], dcolwidth)
    }
  }
}
function togglecolourblind() {
  setting.colourblind = !setting.colourblind
}

function drawsettingstab(startx, starty, widthallowed) {
  textSize(widthallowed/25)
  textAlign(LEFT,BASELINE);
  let ydisp = 3
  fill("#F0E0FF")
  strokeWeight(2)
  stroke(0)
  rect(startx+10, starty+ydisp+5, widthallowed/3, widthallowed/20)
  fill("#000000")
  noStroke()
  text("Export Crossword", startx + 10 + widthallowed/200, starty+ydisp+5+(widthallowed/24))
  interfacedata.buttons.exportopen = {x:startx+10, y:starty+5, dx:startx+widthallowed/3+10, dy:starty+5+widthallowed/20, func: exportopen}
  textAlign(LEFT, TOP)
  text(interfacedata.errornotice, startx + 12 + widthallowed/3, starty+ydisp+5, 2*widthallowed/3 - 4)
  ydisp += 5+widthallowed/8
  drawtoggle(startx+10, starty+ydisp, widthallowed/12, widthallowed/12, setting.colourblind)
  interfacedata.buttons.setcolourblind = {x:startx+10, y:starty+ydisp, dx:startx+widthallowed/12+10, dy:starty+ydisp+widthallowed/12, func: togglecolourblind}
  fill("#000000")
  noStroke()
  textAlign(LEFT,CENTER)
  text("Colourblind mode", startx+15+widthallowed/12, starty+ydisp+widthallowed/24)
  ydisp += widthallowed/12 + 10
}

function settingstabclose() {
  delete interfacedata.buttons.exportopen
  delete interfacedata.buttons.setcolourblind
}

function hidedisable(inputelement) {
  inputelement.position(10000, 10000);
  inputelement.attribute("disabled", true);
}

function drawtabs(startx, endx) {
  stroke(colourscheme.cellwall)
  strokeWeight(3)
  textAlign(CENTER, BASELINE);
  noFill()
  rect(startx, 30, endx-startx+1, windowHeight-21)
  fill(colourscheme.backgrounddark)
  rect(startx, 2, endx-startx+1, 28)
  // tab list: keyboard, clues, attributes, interactsetting
  let tabwidth = (endx-startx+1)/5
  fill(colourscheme.background)
  noStroke()
  rect(startx + tabwidth*interfacedata.tabopen+1, 3, tabwidth-2, 29)
  strokeWeight(3)
  stroke(colourscheme.cellwall)
  line(startx+tabwidth, 2, startx+tabwidth, 30)
  line(startx+2*tabwidth, 2, startx+2*tabwidth, 30)
  line(startx+3*tabwidth, 2, startx+3*tabwidth, 30)
  line(startx+4*tabwidth, 2, startx+4*tabwidth, 30)
  textSize(min(Math.floor(tabwidth/6), 20))
  noStroke()
  fill(colourscheme.cellwall)
  text("Keyboard", startx + tabwidth/2, 19+(tabwidth/30))
  text("Clues", startx + 3*tabwidth/2, 19+(tabwidth/30))
  text("Attributes", startx + 5*tabwidth/2, 19+(tabwidth/30))
  text("Generator", startx + 7*tabwidth/2, 19+(tabwidth/30))
  text("Settings", startx + 9*tabwidth/2, 19+(tabwidth/30))
}

function draw() {
  textAlign(CENTER, BASELINE)
  if (interfacedata.tabopen != 1) {
    gridobjectdata.fullwords = []
    findstarts()
  }
  if (interfacedata.tabopen == 5) {
    background("#FFFFFF");
    drawcrossgrid(0,min(windowHeight/10,windowWidth/4))
  } else {
    background(colourscheme.background);
    drawcrossgrid()
  }
  if (interfacedata.tabopen == 0) {
    definedisplayedkeyboard(gridobjectdata.widthend,32,windowWidth-gridobjectdata.widthend-1, false)
  } else {gridobjectdata.selectdrag[4] = 0; if (interfacedata.tabopen == 1) {
      drawcluestab(gridobjectdata.widthend,32,windowWidth-gridobjectdata.widthend-1)
    } else if (interfacedata.tabopen == 2) {
      drawattributetab(gridobjectdata.widthend,32,windowWidth-gridobjectdata.widthend-1)
    } else if (interfacedata.tabopen == 3) {
      drawgentab(gridobjectdata.widthend,32,windowWidth-gridobjectdata.widthend-1)
    } else if (interfacedata.tabopen == 4) {
      drawsettingstab(gridobjectdata.widthend,32,windowWidth-gridobjectdata.widthend-1)
    }
  }
  textAlign(LEFT,BASELINE);
  drawdragselection(gridobjectdata.selectdrag)
  if (interfacedata.tabopen != 5) {
    drawtabs(gridobjectdata.widthend + 2, windowWidth - 2)
    delete interfacedata.buttons.takescreenshot
    delete interfacedata.buttons.exportreturn
  } else {
    drawexportpage(interfacedata.assignedclues, windowWidth-gridobjectdata.widthend-1,gridobjectdata.trueheight, gridobjectdata.widthend, gridobjectdata.heightend - gridobjectdata.trueheight)
  }
  if (gendata.generating) {
    generatecrossword()
  }
}

// taking inputs
// keyboard
window.addEventListener("keydown", function (event) {
  console.log(event.key)
  if (interfacedata.tabopen == 0) {
    if (event.defaultPrevented) {
      return; // do nothing if the event was already processed
    }
    if (keyIsDown(17)) {
      keypressed("ctrl " + event.key)
    } else if (event.key != "Control") {
      keypressed(event.key);
    }
    event.preventDefault();
  }
}, true);

function keypressed(key) {
  switch(key) {
    case " ":
      gridobjectdata.selectposition[2] = !gridobjectdata.selectposition[2];
      break;
    case "ArrowUp":
      gotonextselect(false, true);
      break;
    case "ArrowDown":
      gotonextselect(true, true);
      break;
    case "ArrowLeft":
      gotonextselect(false, false);
      break;
    case "ArrowRight":
      gotonextselect(true, false);
      break;
    case "Enter":
      gotonextselect(true,gridobjectdata.selectposition[2]);
      break;
    case "F11":
      toggleFullscreen();
      windowResized();
      break;
    case "`":
      //gridobjectdata.height += 1;
      break;
    case "ctrl z":
      unredo(0);
      break;
    case "ctrl y":
      unredo(1);
      break;
    case "-":
      //drawexportpage(interfacedata.assignedclues, windowWidth-gridobjectdata.truewidth-1,gridobjectdata.trueheight)
      break;
    case "=":
      break;
    default:
      if (gridobjectdata.selectdrag[4] == 1) {
        for (let x = gridobjectdata.selectdrag[0]; x <= gridobjectdata.selectdrag[2]; x++) {
          for (let y = gridobjectdata.selectdrag[1]; y <= gridobjectdata.selectdrag[3]; y++) {
            applykeychange(key, x, y, true)
          }
        }
      } else {
        applykeychange(key, gridobjectdata.selectposition[0], gridobjectdata.selectposition[1], false)
      }
      if (isAlphanumeric(key) || ["#", ".", ",","Delete","Backspace"].includes(key)) {
        updateundo()
      }
  }
}

function applykeychange(key, posx, posy, fromdrag) {
  if (isAlphanumeric(key) && key.length === 1) {
    let keypressed = key.toUpperCase();
    if (fromdrag) {
      if (gridobjectdata.stored[posx][posy].content != "~b") {
        gridobjectdata.stored[posx][posy].content = keypressed;
      }
    } else {
      gridobjectdata.stored[posx][posy].content = keypressed;
      gotonextselect(true,gridobjectdata.selectposition[2]);
      while (gridobjectdata.stored[gridobjectdata.selectposition[0]][gridobjectdata.selectposition[1]].content == "~b") {
        gotonextselect(true,gridobjectdata.selectposition[2]);
      }
    }
  } else {
    switch (key) {
      case "#": //followthrough
      case ".":
        if (fromdrag) {
          gridobjectdata.stored[posx][posy].content = "~b"
        } else {
          gridobjectdata.stored[posx][posy].content = ( gridobjectdata.stored[posx][posy].content === "~b") ? "~e" : "~b";
        }
        gridobjectdata.stored[posx][posy].shading = 0
        gridobjectdata.stored[posx][posy].shape = "none"
        break;
      case ",":
        let barProperty = "barred" + ["x","y"][Number(gridobjectdata.selectposition[2])];
        let selectedObject = gridobjectdata.stored[posx][posy];
        selectedObject[barProperty] = !selectedObject[barProperty];
        break;
      case "Delete": // followthrough
      case "Backspace":
        if (gridobjectdata.stored[posx][posy].content == "~e" && !fromdrag) {
          gotonextselect(false,gridobjectdata.selectposition[2]);
          gridobjectdata.stored[gridobjectdata.selectposition[0]][gridobjectdata.selectposition[1]].content = "~e";
        } else {
          gridobjectdata.stored[posx][posy].content = "~e";
        }
        break;
      default:
        break;
    }
  }
}

function gotonextselect(forward = true, direction = true) {
  if (direction) { // vertical selection mode
    if (forward) { // forwards
      gridobjectdata.selectposition[1]++;
      if (gridobjectdata.selectposition[1] >= gridobjectdata.height) {
        gridobjectdata.selectposition[1] = 0;
        gridobjectdata.selectposition[0]++;
        if (gridobjectdata.selectposition[0] >= gridobjectdata.width) {
          gridobjectdata.selectposition[0] = 0;
        }
      }
    } else { // backwards
      gridobjectdata.selectposition[1]--;
      if (gridobjectdata.selectposition[1] < 0) {
        gridobjectdata.selectposition[1] = gridobjectdata.height - 1;
        gridobjectdata.selectposition[0]--;
        if (gridobjectdata.selectposition[0] < 0) {
          gridobjectdata.selectposition[0] = gridobjectdata.width - 1;
        }
      }
    }
  } else { // horizontal selection mode
    if (forward) { // forwards
      gridobjectdata.selectposition[0]++;
      if (gridobjectdata.selectposition[0] >= gridobjectdata.width) {
        gridobjectdata.selectposition[0] = 0;
        gridobjectdata.selectposition[1]++;
        if (gridobjectdata.selectposition[1] >= gridobjectdata.height) {
          gridobjectdata.selectposition[1] = 0;
        }
      }
    } else { // backwards
      gridobjectdata.selectposition[0]--;
      if (gridobjectdata.selectposition[0] < 0) {
        gridobjectdata.selectposition[0] = gridobjectdata.width - 1;
        gridobjectdata.selectposition[1]--;
        if (gridobjectdata.selectposition[1] < 0) {
          gridobjectdata.selectposition[1] = gridobjectdata.height - 1;
        }
      }
    }
  }
}


// mouse
function mousePressed() {
  if (!gendata.generating) {
    console.log("Click!", mouseX, mouseY);
    interfacedata.errornotice = ""
    interfacedata.scrolledmousestart = mouseY
    for (let button in interfacedata.buttons) {
      if (mouseX > interfacedata.buttons[button].x && mouseX < interfacedata.buttons[button].dx && mouseY > interfacedata.buttons[button].y && mouseY < interfacedata.buttons[button].dy) {
        if (interfacedata.buttons[button].length=6) {
          interfacedata.buttons[button].func.apply(this, interfacedata.buttons[button].params)
        } else {
          interfacedata.buttons[button].func()
        }
      }
    }
    if (mouseX <= gridobjectdata.truewidth && mouseY <= gridobjectdata.trueheight) {
      let selectedX = Math.floor(gridobjectdata.width * mouseX / gridobjectdata.truewidth);
      let selectedY = Math.floor(gridobjectdata.height * mouseY / gridobjectdata.trueheight);
      if (selectedX == gridobjectdata.selectposition[0] && selectedY == gridobjectdata.selectposition[1]) {
        gridobjectdata.selectposition[2] = !gridobjectdata.selectposition[2];
      } else {
        gridobjectdata.selectposition[0] = selectedX;
        gridobjectdata.selectposition[1] = selectedY;
      }
      gridobjectdata.selectdrag[0] = selectedX;
      gridobjectdata.selectdrag[1] = selectedY;
      gridobjectdata.selectdrag[4] = 0;
    }
    if (interfacedata.tabopen == 0) {
      definedisplayedkeyboard(gridobjectdata.truewidth,30,windowWidth-gridobjectdata.truewidth-1, true)
    }
    if (interfacedata.tabopen != 5) {
      if (mouseY > 0 && mouseY < 30) {
        let tabwidth = (windowWidth-gridobjectdata.truewidth-4)/5
        if (mouseX >= gridobjectdata.truewidth+2 && mouseX < gridobjectdata.truewidth+2 + tabwidth) {
          if (interfacedata.tabopen == 1) {
            cluestabclose()
          }
          interfacedata.tabopen = 0
          attributetabclose()
          gentabclose()
        } else if (mouseX >= gridobjectdata.truewidth+2 + tabwidth && mouseX < gridobjectdata.truewidth+2 + 2*tabwidth) {
          interfacedata.tabopen = 1
          cluestabinit()
          attributetabclose()
          gentabclose()
        } else if (mouseX >= gridobjectdata.truewidth+2 + 2*tabwidth && mouseX < gridobjectdata.truewidth+2 + 3*tabwidth) {
          if (interfacedata.tabopen == 1) {
            cluestabclose()
          }
          gentabclose()
          interfacedata.tabopen = 2
        } else if (mouseX >= gridobjectdata.truewidth+2 + 3*tabwidth && mouseX < gridobjectdata.truewidth+2 + 4*tabwidth) {
          if (interfacedata.tabopen == 1) {
            cluestabclose()
          }
          attributetabclose()
          gentabinit()
          interfacedata.tabopen = 3
        } else if (mouseX >= gridobjectdata.truewidth+2 + 4*tabwidth && mouseX < gridobjectdata.truewidth+2 + 5*tabwidth) {
          if (interfacedata.tabopen == 1) {
            cluestabclose()
          }
          attributetabclose()
          gentabclose()
          interfacedata.tabopen = 4
        }
      }
    }
  }
}

function mouseDragged() {
  /*
  if (interfacedata.tabopen == 0) {
    if (mouseX <= gridobjectdata.truewidth-1 && mouseY <= gridobjectdata.trueheight-1) {
      console.log("Drag ", gridobjectdata.selectdrag)
      gridobjectdata.selectdrag[4] = 2
      gridobjectdata.selectdrag[2] = Math.floor(gridobjectdata.width * mouseX / gridobjectdata.truewidth)
      gridobjectdata.selectdrag[3] = Math.floor(gridobjectdata.height * mouseY / gridobjectdata.trueheight)
    }
  }*/
  if (interfacedata.scrolledmousestart != false) {
    if (interfacedata.tabopen == 1) {
      interfacedata.scrolledclues += interfacedata.scrolledmousestart - mouseY
      interfacedata.scrolledmousestart = mouseY
      let lowerlimit = gridobjectdata.fullwords.length*80-windowHeight+32
      if (interfacedata.scrolledclues < 0 || lowerlimit < 0) {
        interfacedata.scrolledclues = 0
      } else if (interfacedata.scrolledclues > lowerlimit) {
        interfacedata.scrolledclues = lowerlimit
      }
    } else if (interfacedata.tabopen == 3) {
      interfacedata.scrolledgen += interfacedata.scrolledmousestart - mouseY
      interfacedata.scrolledmousestart = mouseY
      let lowerlimit = interfacedata.generatorwords.length*40-windowHeight+(windowWidth-gridobjectdata.widthend)/1.4
      console.log(lowerlimit)
      if (interfacedata.scrolledgen < 0 || lowerlimit < 0) {
        interfacedata.scrolledgen = 0
      } else if (interfacedata.scrolledgen > lowerlimit) {
        interfacedata.scrolledgen = lowerlimit
      }
    }
  }
}

function mouseReleased() {
  interfacedata.scrolledmousestart = false
  /*
  if (gridobjectdata.selectdrag[4] == 2) {
    gridobjectdata.selectdrag[4] = 1
    if (gridobjectdata.selectdrag[2] < gridobjectdata.selectdrag[0]) {
      [gridobjectdata.selectdrag[0], gridobjectdata.selectdrag[2]] = [gridobjectdata.selectdrag[2], gridobjectdata.selectdrag[0]]
    }
    if (gridobjectdata.selectdrag[3] <  gridobjectdata.selectdrag[1]) {
      [gridobjectdata.selectdrag[1], gridobjectdata.selectdrag[3]] = [gridobjectdata.selectdrag[3], gridobjectdata.selectdrag[1]]
    }
    console.log("Drag done ", gridobjectdata.selectdrag)
  }
  */
}

function mouseWheel(event) {
  if (interfacedata.tabopen == 1) {
    interfacedata.scrolledclues -= event.delta
    let lowerlimit = gridobjectdata.fullwords.length*80-windowHeight+32
    if (interfacedata.scrolledclues < 0 || lowerlimit < 0) {
      interfacedata.scrolledclues = 0
    } else if (interfacedata.scrolledclues > lowerlimit) {
      interfacedata.scrolledclues = lowerlimit
    }
  } else if (interfacedata.tabopen == 3) {
    interfacedata.scrolledgen -= event.delta
    let lowerlimit = interfacedata.generatorwords.length*40-windowHeight+(windowWidth-gridobjectdata.widthend)/1.4
    if (interfacedata.scrolledgen < 0 || lowerlimit < 0) {
      interfacedata.scrolledgen = 0
    } else if (interfacedata.scrolledgen > lowerlimit) {
      interfacedata.scrolledgen = lowerlimit
    }
  }
}