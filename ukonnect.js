var todayconnect = []

var progress = {
    selection: [],
    shuffleorder: [],
    foundcat: [],
    previous: [],
    prevfoundcol: [],
    buzztext: [],
    lossstate: false,
    resultdelay: 0,
}

var ui = {
    buttonpos: {},
    hovericon: -1,
    dragbutton: {x:-1, y:-1, time:0, drag:false},
    oneaway: 0,
    showprev: false,
    catcolour: ["#FDFD40","#00FF00","#97B7F5","#FF11FF"],
    screentype: 0,
    metabuttons: {starttodays: {}},
}

var animation = {
    loadt: 0,
    lastpress: 0,
}

var meta = {
    fullukonnect: "",
    daysadjust: 0,
    lognotice: [],
    debug: false,
}

function preload() { 
    document.title = "ukonnect"
    usedfont = loadFont("Roboto-Medium.ttf") // WOO
    console.log("preload")
}

function organisedaily(textfile) {
    let numlist = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    todayconnect.push(["Group1", "thing", "thang", "theng", "thung"]);
    todayconnect.push(["Group2", "shing", "shang", "sheng", "shungshung"]);
    todayconnect.push(["Group3", "ing", "ang", "eng", "ung"]);
    todayconnect.push(["Group4", "grin", "grij", "grik", "grip"]);
    todayconnect.push(numlist);
    meta.fullukonnect = textfile
    todayconnect = []
    let byline = textfile.split("\r\n")
    let todaydate = new Date()
    let adjustmentbydate = -7 + 7*meta.daysadjust
    for (let date = 0; date < byline.length; date += 7) {
        let splitdate = byline[date].split(".")
        for (let i = 0; i < 3; i++) {
            splitdate[i] = Number(splitdate[i])
        }
        if (todaydate.getUTCDate() >= splitdate[0]) {
            if (todaydate.getUTCMonth()+1 >= splitdate[1]) {
                if (todaydate.getUTCFullYear() < splitdate[2]) {
                    todaydate = date + adjustmentbydate
                    break
                }
            } else if (todaydate.getUTCFullYear() <= splitdate[2]) {
                todaydate = date + adjustmentbydate
                break
            }
        } else if (todaydate.getUTCMonth()+1 <= splitdate[1]) {
            if (todaydate.getUTCFullYear() <= splitdate[2]) {
                todaydate = date + adjustmentbydate
                break
            } 
        } else if (todaydate.getUTCFullYear() < splitdate[2]) {
            todaydate = date + adjustmentbydate
            break
        } 
    }
    for (let line = 0; line < 4; line++) {
        todayconnect.push(byline[todaydate+1+line].split("|"))
    }
    todayconnect.push(byline[todaydate+5])
    let splitdate = byline[todaydate].split(".")
    for (let i = 0; i < 3; i++) {
        splitdate[i] = Number(splitdate[i])
    }
    todayconnect.push(splitdate)

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 5; j++) {
            todayconnect[i][j] = todayconnect[i][j].toUpperCase();
        }
    }

    let wordlist = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 1; j < 5; j++) {
            wordlist.push(todayconnect[i][j]);
        }
    }

    let sortedwordlist = [];
    if (todayconnect[4].split(",").length == 16) {
        todayconnect[4] = todayconnect[4].split(",")
    } else {
        todayconnect[4] = todayconnect[4].split(",")
        console.log(todayconnect[4])
        if (todayconnect[4].length > 1) {
            for (let i = 0; i < todayconnect[4].length-1; i++) {
                numlist.splice(numlist.indexOf(Number(todayconnect[4][i])),1)
            }
        }
        todayconnect[4].splice(-1,1)
        todayconnect[4] = todayconnect[4].concat(shuffleseed(numlist, todayconnect[4][todayconnect[4].length-1]))
    }
    for (let i = 0; i < 16; i++) {
        sortedwordlist.push(wordlist[Number(todayconnect[4][i]) - 1].toUpperCase());
    }

    todayconnect.push(structuredClone(sortedwordlist));
    todayconnect.push(byline[todaydate+7].split("."))
    progress.shuffleorder = structuredClone(sortedwordlist);
}

let setupready = false
async function setup() {
    createCanvas(windowWidth, windowHeight);
    rectMode(CORNER);
    textFont(usedfont);

    try {
        const response = await fetch("ukonnectdaily.txt");
        const text = await response.text();
        organisedaily(text);
    } catch (err) {
        console.error("Failed to fetch daily file:", err);
    }
    setupready = true
    animation.loadt = Date.now()
    console.log("setup");
}


function windowResized() {
    createCanvas(windowWidth, windowHeight);
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
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
function shuffleseed(array, seed) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    seed = seed || 1;
    let random = function() {
      var x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
}
function adjustHue(r, g, b, hueShift) {
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
  
    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    h = (h * 360 + hueShift) % 360;
    if (h < 0) h += 360;
  
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }
    let newr = Math.round(hue2rgb(p, q, h + 1/3) * 255);
    let newg = Math.round(hue2rgb(p, q, h) * 255);
    let newb = Math.round(hue2rgb(p, q, h - 1/3) * 255);
    return (newr, newg, newb);
}
  

function fadebox(message,size,time) {
    let opac = 255
    if (Date.now() > time + 1500) {
        opac = 255 - ((Date.now() - time - 1500) * 256 / 500)
    }
    fill(255,255,255,opac)
    strokeWeight(widthallowed/200)
    stroke(0,0,0,opac)
    rect(startx + widthallowed/2 - widthallowed/10, starty, widthallowed/5, widthallowed/25, widthallowed/25)
    noStroke()
    fill(0,0,0,opac)
    text(message, startx + widthallowed/2, starty + widthallowed/53)
}
function drawgradientrect(x, y, w, h, c1, c2) {
    noStroke();
    for (let i = 0; i < w; i++) {
        let inter = map(i, 0, w, 0, 1);
        let c = lerpColor(c1, c2, inter);
        fill(c);
        rect(x + i, y, 1, h);
    }
}

function displaygrid(startx, starty, widthallowed) {
    for (let y = 0; y < progress.foundcat.length; y++) {
        stroke(0)
        strokeWeight(widthallowed/200)
        textSize(widthallowed/35)
        fill(ui.catcolour[progress.foundcat[y]])
        rect(startx + widthallowed/100,starty + widthallowed/100 + widthallowed*y/8,49*widthallowed/50,widthallowed/8-widthallowed/50,round(widthallowed/100))
        noStroke()
        fill("#000000")
        text(todayconnect[progress.foundcat[y]][0],startx + widthallowed/2,starty + widthallowed/25 + widthallowed*y/8)
        let textthing = ""
        for (let i = 1; i < 5; i++) {
            textthing += todayconnect[progress.foundcat[y]][i] + ", "
        }
        textthing = textthing.slice(0,-2)
        text(textthing,startx + widthallowed/2,starty + 2*widthallowed/25 + widthallowed*y/8)
    }
    let ychange = progress.foundcat.length
    if (progress.lossstate && Date.now() - progress.resultdelay > 1000) {
        for (let y = 0; y < 4; y++) {
            if (!progress.foundcat.includes(y)) {
                stroke("#FF0000")
                strokeWeight(widthallowed/200)
                textSize(widthallowed/35)
                fill(["#FDFD40","#00FF00","#97B7F5","#FF11FF"][y])
                rect(startx + widthallowed/100,starty + widthallowed/100 + widthallowed*ychange/8,49*widthallowed/50,widthallowed/8-widthallowed/50,round(widthallowed/100))
                noStroke()
                fill("#000000")
                text(todayconnect[y][0],startx + widthallowed/2,starty + widthallowed/25 + widthallowed*ychange/8)
                let textthing = ""
                for (let i = 1; i < 5; i++) {
                    textthing += todayconnect[y][i] + ", "
                }
                textthing = textthing.slice(0,-2)
                text(textthing,startx + widthallowed/2,starty + 2*widthallowed/25 + widthallowed*ychange/8)
                ychange += 1
            }
        }
    }
    ui.buttonpos = {x: startx, y: starty, dx: widthallowed/4, offset: widthallowed/100}
    for (let y = Math.max(progress.foundcat.length, (ui.screentype == 3)*4); y < 5; y++) {
        for (let x = 0; x < 4; x++) {
            stroke(207)
            strokeWeight(widthallowed/200)
            textSize(widthallowed/30)
            fill("#F3F6F3")
            if (y < 4) {
                if (ui.dragbutton.x == x && ui.dragbutton.y == y && ui.dragbutton.drag) {
                    continue
                }
                if (progress.selection.indexOf(progress.shuffleorder[y*4+x-progress.foundcat.length*4].toUpperCase()) > -1) {
                    if (Date.now() - progress.resultdelay < 500) {
                        fill((48*(progress.resultdelay-Date.now()+500) / 500 + 207),(48*(Date.now()-progress.resultdelay-500) / 500 + 207),(48*(Date.now()-progress.resultdelay-500) / 500 + 207))
                    } else {
                        fill("#CFCFCF")
                    }
                }
            } else {
                fill("#EEEEFF")
                if (mouseX > (ui.buttonpos.x + ui.buttonpos.offset + ui.buttonpos.dx*x) && mouseX < (ui.buttonpos.x - ui.buttonpos.offset + ui.buttonpos.dx*(x+1))) {
                    if (mouseY > (ui.buttonpos.y + ui.buttonpos.offset + ui.buttonpos.dx*y/2) && mouseY < (ui.buttonpos.y - ui.buttonpos.offset + ui.buttonpos.dx*(y+1)/2)) {
                        fill("#BFCFDF")
                    }
                }
            }
            rect(startx + widthallowed/100 + widthallowed*x/4,starty + widthallowed/100 + widthallowed*y/8,23*widthallowed/100,widthallowed/8-widthallowed/50,round(widthallowed/100))
            noStroke()
            fill("#000000")
            if (y < 4) {
                let textthing = progress.shuffleorder[y*4+x-progress.foundcat.length*4].toUpperCase()
                let sizeo = widthallowed/20
                while (textWidth(textthing) > 21*widthallowed/100) {
                    sizeo *= 0.95
                    textSize(sizeo)
                }
                text(textthing,startx + widthallowed/8 + widthallowed*x/4,starty + widthallowed/17 + widthallowed*y/8)
            } else {
                textSize(widthallowed/30)
                let textthing = ["Previous Guesses", "Deselect All", "Shuffle", "Submit"][x].toUpperCase()
                text(textthing,startx + widthallowed/50 + widthallowed*x/4,starty + widthallowed/17 + widthallowed*y/8, widthallowed/4-widthallowed/25)
            }
        }
    }
    if (ui.dragbutton.x != -1 && ui.dragbutton.drag) {
        let textthing = progress.shuffleorder[ui.dragbutton.y*4+ui.dragbutton.x-progress.foundcat.length*4].toUpperCase()
        let sizeo = widthallowed/20
        while (textWidth(textthing) > 21*widthallowed/100) {
            sizeo *= 0.95
            textSize(sizeo)
        }
        text(textthing,mouseX,mouseY)
    }
    if (Date.now() < ui.oneaway + 2000) {
        let opac = 255
        if (Date.now() > ui.oneaway + 1500) {
            opac = 255 - ((Date.now() - ui.oneaway - 1500) * 256 / 500)
        }
        fill(255,255,255,opac)
        strokeWeight(widthallowed/200)
        stroke(0,0,0,opac)
        rect(startx + widthallowed/2 - widthallowed/10, starty, widthallowed/5, widthallowed/25, widthallowed/25)
        noStroke()
        fill(0,0,0,opac)
        text("One Away...", startx + widthallowed/2, starty + widthallowed/53)
    }
    fill(0,0,0,255)
    let textthing = "Mistakes Remaining:".toUpperCase()
    textSize(widthallowed/40)
    text(textthing, startx + widthallowed/2 - textWidth(textthing)/2, starty + widthallowed*5/8 + widthallowed/36)
    for (let i = 0; i < 4-progress.previous.length+progress.foundcat.length; i++) {
        circle(startx + widthallowed/2 + (i+1)*widthallowed / 25, starty + widthallowed*5/8 + widthallowed/32, widthallowed/50)
    }
}

function displayprevious(startx, starty, widthallowed) {
    for (let y = 0; y < progress.previous.length; y++) {
        for (let x = 0; x < 4; x++) {
            stroke(0)
            strokeWeight(widthallowed/200)
            textSize(widthallowed/30)
            fill("#FFFFFF")
            let textthing = progress.previous[y][x].toUpperCase()
            let textindex = progress.prevfoundcol.indexOf(textthing)
            if (textindex != -1) {
                fill(ui.catcolour[progress.prevfoundcol[textindex+1]])
            } else if (progress.lossstate) {
                for (let c = 0; c < 4; c++) {
                    if (todayconnect[c].includes(textthing)) {
                        fill(ui.catcolour[c])
                        break
                    }
                }
            }
            rect(startx + widthallowed/100 + widthallowed*x/4,starty + widthallowed/100 + widthallowed*y/8,23*widthallowed/100,widthallowed/8-widthallowed/50,round(widthallowed/100))
            noStroke()
            fill("#000000")
            let sizeo = widthallowed/20
            while (textWidth(textthing) > 21*widthallowed/100) {
                sizeo *= 0.95
                textSize(sizeo)
            }
            text(textthing, startx + widthallowed/8 + widthallowed*x/4, starty + widthallowed/17 + widthallowed*y/8)
        }
        textSize(widthallowed/30)
        textAlign(LEFT, CENTER)
        text(progress.buzztext[y], startx + widthallowed/128 + widthallowed, starty + widthallowed/17 + widthallowed*y/8)
        textAlign(CENTER, CENTER)
    }
    if (progress.previous.length == 0) {
        textSize(widthallowed/30)
        text("No guesses yet... try something!", startx + widthallowed/2, starty + widthallowed/25)
    }
}

function displaybanner(widthallowed, bannerheight, todaynumber) {
    fill("#F00090")
    noStroke()
    rect(0,0,widthallowed,bannerheight)
    textSize(Math.min(bannerheight/2, widthallowed/50))
    fill("#000000")
    text("Create four groups of four that share a connection",widthallowed/2, bannerheight/2)
    textAlign(LEFT)
    text("UKonnect: #" + todaynumber[3],widthallowed/100, bannerheight/2)
    textAlign(RIGHT)
    text(todaynumber[0] + "/" + todaynumber[1] + "/" + todaynumber[2],99*widthallowed/100, bannerheight/2)
    stroke(0)
    strokeWeight(bannerheight/20)
    line(0,bannerheight,widthallowed,bannerheight)
}

function viewgame() {
    ui.screentype = 1
    animation.loadt = Date.now()
}
function viewbacktogrid() {
    ui.screentype = 3
}

function displayinterscreen(boxwidth) {
    noStroke()
    textSize(boxwidth/20)
    fill("#000000")
    textAlign(CENTER,CENTER)
    if (ui.screentype == 0) {
        text("Welcome to UKonnect!", windowWidth/2, windowHeight/2 - boxwidth/10)
        textSize(boxwidth/30)
        let h = 1
        let button = ui.metabuttons.starttodays
        button.x = windowWidth/2 - boxwidth/5
        button.dx = 2*boxwidth/5
        button.y = windowHeight/2 - 3*boxwidth/20 + h*boxwidth/5
        button.dy = boxwidth/10
        if (Date.now() - animation.loadt > 200) {
            button.func = viewgame
        }
        //fill(adjustHue(255,20,20,Math.atan(Math.sin(Date.now() - animation.loadt)/10)))
        fill("#FFFFFF")
        stroke(0)
        strokeWeight(boxwidth/200)
        rect(button.x,button.y,button.dx,button.dy, boxwidth/30)
        noStroke()
        fill("#000000")
        text("Play Most Recent", windowWidth/2, windowHeight/2 - boxwidth/10 + h*boxwidth/5)
        h++
    } else if (ui.screentype == 2) {
        let solved = progress.previous.length - progress.foundcat.length < 4
        if (solved) {
            text("Congratulations!", windowWidth/2, windowHeight/2 - 2*boxwidth/10)
        } else [
            text("Better luck next time!", windowWidth/2, windowHeight/2 - 2*boxwidth/10)
        ]
        text("Skill: " + Number(result()), windowWidth/2, windowHeight/2 - boxwidth/10)
        textSize(boxwidth/30)
        let h = 1
        let button = ui.metabuttons.starttodays
        button.x = windowWidth/2 - boxwidth/5
        button.dx = 2*boxwidth/5
        button.y = windowHeight/2 - 3*boxwidth/20 + h*boxwidth/5
        button.dy = boxwidth/10
        if (Date.now() - animation.loadt > 200) {
            button.func = viewbacktogrid
        }
        fill("#FFFFFF")
        stroke(0)
        strokeWeight(boxwidth/200)
        rect(button.x,button.y,button.dx,button.dy, boxwidth/30)
        noStroke()
        fill("#000000")
        text("Return to Grid", windowWidth/2, windowHeight/2 - boxwidth/10 + h*boxwidth/5)
        text("Play the next UKonnect on " + todayconnect[7][0] + "/" + todayconnect[7][1], windowWidth/2, windowHeight/2 + 2*boxwidth/10)
        h++
    }
}

function submitcon() {
    if (progress.selection.length == 4) {
        progress.selection.sort()
        progress.resultdelay = Date.now()
        if (!progress.previous.some(innerlist => arraysEqual(innerlist, progress.selection))) {
            progress.previous.push(structuredClone(progress.selection))
            let buzztext = ""
            for (let i = 0; i < 4; i++) {
                let group = todayconnect[i]
                let connectors = []
                let numinc = 0
                for (let j = 1; j < 5; j++) {
                    connectors.push(group[j].toUpperCase())
                    if (progress.selection.includes(group[j].toUpperCase())) {
                        numinc += 1
                    }
                }
                if (numinc > 2) {
                    if (numinc == 4) {
                        buzztext = "Connection"
                        progress.foundcat.push(i)
                        progress.selection = []
                        for (let j = 1; j < 5; j++) {
                            progress.shuffleorder.splice(progress.shuffleorder.indexOf(group[j]),1)
                            progress.prevfoundcol.push(group[j])
                            progress.prevfoundcol.push(i)
                        }
                    } else {
                        buzztext = "One Away"
                        ui.oneaway = Date.now()
                    }
                    break
                } else {buzztext = "X"}
                connectors.sort()
            }
            progress.buzztext.push(buzztext)
        }
    }
    if (progress.previous.length - progress.foundcat.length > 3 || progress.foundcat.length == 4) {
        progress.lossstate = true
        result()
    }
}

function result() {
    let skill = 0
    for (let i = 0; i < progress.foundcat.length; i++) {
        skill += progress.foundcat[i] * (4-i)
        skill += 10
    }
    skill += 10*(4+progress.foundcat.length-progress.previous.length)
    for (let i = 0; i < progress.buzztext.length; i++) {
        if (progress.buzztext[i] == "One Away") {
            skill += 5
        }
    }
    console.log(skill)
    return skill
}

function draw() {
    if (!setupready) {return};
    //if (ui.screentype == 0) {ui.screentype = 1}
    textAlign(CENTER, CENTER)
    background("#FFFFFF")
    let bannerheight = windowHeight/20
    if (ui.screentype == 1 || ui.screentype == 3) {
        let usedwidth = Math.min((windowWidth-20)/(1+ui.showprev), (windowHeight-bannerheight)*8/5.5 -20)
        displaygrid((windowWidth - usedwidth)/2 + ui.showprev*windowWidth/4, bannerheight + 10, usedwidth)
        if (ui.showprev) {
            displayprevious(windowWidth/2 - usedwidth/0.99, bannerheight + 10, usedwidth/1.2)
        }
    } else {
        displayinterscreen(Math.min((windowWidth-20)/(1+ui.showprev), (windowHeight-bannerheight)*8/5.5 -20))
    }
    if (!(Date.now() - progress.resultdelay < 1000 || !progress.lossstate)) {
        if (ui.screentype == 1) {ui.screentype = 2}
    }
    displaybanner(windowWidth,bannerheight,todayconnect[5])
    if (meta.debug) {
        textSize(8)
        noStroke()
        fill("#000000")
        textAlign(LEFT)
        for (let i = 0; i < meta.lognotice.length; i++) {
            text(meta.lognotice[i], 4, 4 + 10*i)
        }
    }
}

function mousePressed() {
    if (mouseX < 20 && mouseY < 20) {
        meta.debug = true
        meta.lognotice.push("Enabled debug 0")
    }
    console.log("Click!",mouseX,mouseY)
    for (let y = progress.foundcat.length; y < 5; y++) {
        for (let x = 0; x < 4; x++) {
            if (mouseX > (ui.buttonpos.x + ui.buttonpos.offset + ui.buttonpos.dx*x) && mouseX < (ui.buttonpos.x - ui.buttonpos.offset + ui.buttonpos.dx*(x+1))) {
                if (mouseY > (ui.buttonpos.y + ui.buttonpos.offset + ui.buttonpos.dx*y/2) && mouseY < (ui.buttonpos.y - ui.buttonpos.offset + ui.buttonpos.dx*(y+1)/2)) {
                    console.log(y,x)
                    if (meta.debug) {meta.lognotice.push([y,x,"m"])}
                    if (y == 4) {
                        if (x==1) {
                            progress.selection = []
                        } else if (x==2) {
                            shuffleArray(progress.shuffleorder)
                        } else if (x==3 && !progress.lossstate) {
                            submitcon()
                        } else if (x==0) {
                            ui.showprev = !ui.showprev
                            console.log(structuredClone(progress.shuffleorder))
                        }
                    } else {
                        ui.dragbutton.x = x
                        ui.dragbutton.y = y
                        ui.dragbutton.time = Date.now()
                    }
                }
            }
        }
    }
}

function touchStarted() {
    //if (Date.now() - animation.lastpress < 50) {return}
    animation.lastpress = Date.now()
    console.log("TClick!",mouseX,mouseY)
    for (let y = progress.foundcat.length; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (mouseX > (ui.buttonpos.x + ui.buttonpos.offset + ui.buttonpos.dx*x) && mouseX < (ui.buttonpos.x - ui.buttonpos.offset + ui.buttonpos.dx*(x+1))) {
                if (mouseY > (ui.buttonpos.y + ui.buttonpos.offset + ui.buttonpos.dx*y/2) && mouseY < (ui.buttonpos.y - ui.buttonpos.offset + ui.buttonpos.dx*(y+1)/2)) {
                    console.log(y,x)
                    if (meta.debug) {meta.lognotice.push([y,x,"t"])}
                    if (y < 4) {
                        ui.dragbutton.x = x
                        ui.dragbutton.y = y
                        ui.dragbutton.time = Date.now()
                    }
                }
            }
        }
    }
}

function mouseDragged() {
    ui.dragbutton.drag = true
}
function touchMoved() {
    ui.dragbutton.drag = true
}

function mouseReleased() {
    if (!progress.lossstate && Date.now() - animation.loadt > 100) {
        for (let y = progress.foundcat.length; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (mouseX > (ui.buttonpos.x + ui.buttonpos.offset + ui.buttonpos.dx*x) && mouseX < (ui.buttonpos.x - ui.buttonpos.offset + ui.buttonpos.dx*(x+1))) {
                    if (mouseY > (ui.buttonpos.y + ui.buttonpos.offset + ui.buttonpos.dx*y/2) && mouseY < (ui.buttonpos.y - ui.buttonpos.offset + ui.buttonpos.dx*(y+1)/2)) {
                        if (ui.dragbutton.x == x && ui.dragbutton.y == y) {
                            if (meta.debug) {meta.lognotice.push([y,x,"r"])}
                            let index = progress.selection.indexOf(progress.shuffleorder[y*4+x-progress.foundcat.length*4].toUpperCase())
                            if (index > -1) {
                                progress.selection.splice(index,1)
                            } else {
                                if (progress.selection.length < 4) {
                                    progress.selection.push(progress.shuffleorder[y*4+x-progress.foundcat.length*4].toUpperCase())
                                }
                            }
                        } else if (ui.dragbutton.drag){
                            let tempbutton = progress.shuffleorder[y*4+x-progress.foundcat.length*4]
                            progress.shuffleorder[y*4+x-progress.foundcat.length*4] = progress.shuffleorder[ui.dragbutton.y*4+ui.dragbutton.x-progress.foundcat.length*4]
                            progress.shuffleorder[ui.dragbutton.y*4+ui.dragbutton.x-progress.foundcat.length*4] = tempbutton
                        }
                        break
                    }
                }
            }
        }
    }
    ui.dragbutton.drag = false
    ui.dragbutton.x = -1
    ui.dragbutton.y = -1
    for (let button in ui.metabuttons) {
        if ("func" in ui.metabuttons[button]) {
            if (mouseX > ui.metabuttons[button].x && mouseX < ui.metabuttons[button].x + ui.metabuttons[button].dx && mouseY > ui.metabuttons[button].y && mouseY < ui.metabuttons[button].y + ui.metabuttons[button].dy) {
                ui.metabuttons[button].func()
            }
        }
    }
}

document.addEventListener("keydown", handleKey);
function handleKey(event) {
    console.log(event.key)
    if (event.defaultPrevented) {
        return; // do nothing if the event was already processed
    }
    if (event.key == "+") {
        return
        if (typeof unloadScript === "function") {
            unloadScript();
        }

        // Remove event listener after executing
        document.removeEventListener("keydown", handleKey);
    }
    if (keyIsDown(17)) {
        keypressed("ctrl " + event.key)
    } else if (event.key != "Control") {
        keypressed(event.key);
    }
    event.preventDefault();
}
function keypressed(key) {
    switch(key) {
        case "ctrl -":
            gridobjectdata.selectposition[2] = !gridobjectdata.selectposition[2];
            break;
        case "ctrl =":
            if (meta.debug) {
                meta.daysadjust += 1
                progress = {
                    selection: [],
                    shuffleorder: [],
                    foundcat: [],
                    previous: [],
                    prevfoundcol: [],
                    buzztext: [],
                    lossstate: false,
                    resultdelay: 0,
                }
                ui.screentype = 0
                organisedaily(meta.fullukonnect)
            }
            break;
        default:
            break;
    }
}