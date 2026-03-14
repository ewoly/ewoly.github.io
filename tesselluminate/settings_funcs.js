function opensettings() {
  ui.clickable.main = false
  ui.clickable.setting = true
}
function closesettings() {
  ui.clickable.main = true
  ui.clickable.setting = false
  delete ui.slider.musvol
  delete ui.slider.sfxvol
  delete ui.button.background
  delete ui.button.disanim
  delete ui.button.exitsettings
}

function drawsettings(xstart, ystart, xspace, yspace, orient) {
  noStroke()
  let transparencybg = round((128*anim.val.settingglide/500)).toString(16).padStart(2, "0")
  fill("#000000" + transparencybg)
  rect(0,0,windowWidth, windowHeight)

  let xbyy = [8, 10]
  let blocksize
  if ((xbyy[0]+2)/xspace > (xbyy[1]+2)/yspace) {blocksize = xspace/(xbyy[0]+2)} 
  else {blocksize = yspace/(xbyy[1]+2)}

  let bxd = {x: xstart + xspace/2 - xbyy[0]*blocksize/2,
    y: ystart + blocksize,
    dx: xbyy[0]*blocksize,
    dy: xbyy[1]*blocksize,
    bord: blocksize/4
  }

  let ymove = ((500 - anim.val.settingglide)/500) * (windowHeight - bxd.y)

  function drawslider(slid, colour) {
    slid.y += ymove
    strokeWeight(slid.w/5)
    stroke(colscheme.cellfill)
    line(slid.x + slid.w/2, slid.y + slid.dy/2, slid.x + slid.dx - slid.w/2, slid.y + slid.dy/2)
    fill(colour)
    stroke(colscheme.border)
    let posx = slid.x + (slid.dx-slid.w) * slid.adj.n / (slid.max-slid.min)
    rect(posx, slid.y, slid.w, slid.dy)
    line(posx + slid.w/2, slid.y + slid.dy/4, posx + slid.w/2, slid.y + 3*slid.dy/4)

    noStroke()
    fill(colscheme.border)
    textAlign(LEFT, CENTER)
    text(slid.info + ":", slid.x, slid.y - slid.dy/2)
    textAlign(RIGHT, CENTER)
    text(slid.adj.n, slid.x + slid.dx, slid.y - slid.dy/2)
  }

  function drawbutton(but, truex) {
    let on = setting[but.ref]
    strokeWeight(but.dx/10)
    fill(on ? colscheme.green : colscheme.red)
    stroke(colscheme.border)
    rect(but.x, but.y, but.dx, but.dy)
    if (on) {
    line(but.x + but.dx/4, but.y + but.dy/2, but.x + 3*but.dx/8, but.y + 3*but.dy/4)
    line(but.x + 3*but.dx/8, but.y + 3*but.dy/4, but.x + 3*but.dx/4, but.y + but.dy/4)
    } else {
      line(but.x + but.dx/4, but.y + but.dy/4, but.x + 3*but.dx/4, but.y + 3*but.dy/4)
      line(but.x + 3*but.dx/4, but.y + but.dy/4, but.x + but.dx/4, but.y + 3*but.dy/4)
    }
    noStroke()
    fill(colscheme.border)
    textAlign(LEFT, CENTER)
    text(but.info + ":", truex, but.y + but.dy/2)
  }
  let currentblock = 0
  if (!Object.hasOwn(ui.slider, "musvol")) {
    ui.slider.musvol = {x: bxd.x + blocksize,
      y: bxd.y + (currentblock+1.5)*blocksize,
      w: blocksize,
      dx: (xbyy[0] - 2)*blocksize,
      dy: blocksize,
      min: 0,
      max: 100,
      adj: aud.musvol,
      type: HAND,
      info: "Music Volume",
      avail: "setting"
    }
  }
  currentblock += 2
  if (!Object.hasOwn(ui.slider, "sfxvol")) {
    ui.slider.sfxvol = {x: bxd.x + blocksize,
      y: bxd.y + (currentblock+1.5)*blocksize,
      w: blocksize,
      dx: (xbyy[0] - 2)*blocksize,
      dy: blocksize,
      min: 0,
      max: 100,
      adj: aud.sfxvol,
      type: HAND,
      info: "SFX Volume",
      avail: "setting"
    }
  }
  currentblock += 3
  bxd.y += ymove
  ui.button.disanim = {x: bxd.x + bxd.dx - 2* blocksize,
    y: bxd.y + (currentblock+0.5)*blocksize,
    dx: blocksize,
    dy: blocksize,
    ref: "animations",
    type: HAND,
    func: togglesetting,
    info: "Enable Animations",
    avail: "setting"
  }
  currentblock += 1.2
  ui.button.background = {x: bxd.x + bxd.dx - 2* blocksize,
    y: bxd.y + (currentblock+0.5)*blocksize,
    dx: blocksize,
    dy: blocksize,
    ref: "background",
    type: HAND,
    func: togglesetting,
    info: "Enable Background",
    avail: "setting"
  }
  currentblock += 1.2
  ui.button.reset = {x: bxd.x + bxd.dx/2 - blocksize,
    y: bxd.y + (currentblock+0.5)*blocksize,
    dx: 2*blocksize,
    dy: blocksize,
    ref: "reset",
    type: HAND,
    func: openconfirmation,
    avail: "setting"
  }

  strokeWeight(bxd.bord)
  stroke(colscheme.border)
  fill(colscheme.warmback)
  rect(bxd.x - bxd.bord/2, bxd.y - bxd.bord/2, bxd.dx + bxd.bord, bxd.dy + bxd.bord, blocksize)

  textFont(secondfont)
  textSize(0.75*lodgetextsize("20 characters long##", blocksize, (xbyy[0] - 2)*blocksize))
  textAlign(LEFT, CENTER)
  drawslider(structuredClone(ui.slider.musvol), colscheme.banner)
  drawslider(structuredClone(ui.slider.sfxvol), colscheme.banner)
  drawbutton(ui.button.disanim, bxd.x + blocksize)
  drawbutton(ui.button.background, bxd.x + blocksize)
  fill(colscheme.red)
  stroke("#000")
  iconbg(ui.button.reset)
  textAlign(CENTER, CENTER)
  textSize(lodgetextsize("Reset", ui.button.reset.dy/1.1, ui.button.reset.dx/1.1))
  fill("#000")
  noStroke()
  text("Reset", ui.button.reset.x + ui.button.reset.dx/2, ui.button.reset.y + ui.button.reset.dy/2)
  textFont(usedfont)

  ui.button.exitsettings = {x: bxd.x + bxd.dx - blocksize/2,
    y: bxd.y - blocksize/2,
    dx: blocksize,
    dy: blocksize,
    type: HAND,
    func: closesettings
  }
  strokeWeight(bxd.bord)
  stroke(colscheme.border)
  fill(colscheme.warmback)
  iconbg(ui.button.exitsettings, 0)
  iconimage(images.ui.x_button, ui.button.exitsettings, -0.1)
}

function togglesetting(ref) {
  setting[ref] = !setting[ref]
}

