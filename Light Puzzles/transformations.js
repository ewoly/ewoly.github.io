function rotateXY(x, y, cx, cy, r) { // clockwise
  let dx = x - cx
  let dy = y - cy
  let qx = cx + dx * Math.cos(r) - dy * Math.sin(r)
  let qy = cy + dx * Math.sin(r) + dy * Math.cos(r)
  return [qx, qy]
}

function lodgeimage(w, h, xspace, yspace) {
  let ratio
  if (xspace/w > yspace/h) {
    ratio = yspace/h
  } else {ratio = xspace/w}
  return ratio
}

function iconimage(img, info, stretch = 0){
  image(img, info.x - info.dx*stretch, info.y - info.dy*stretch, info.dx*(1+2*stretch), info.dy*(1+2*stretch))
}
function iconbg(info, stretch = 0){
  rect(info.x - info.dx*stretch, info.y - info.dy*stretch, info.dx*(1+2*stretch), info.dy*(1+2*stretch))
}

function spritedraw(img, x, y, w) {
  let h = img.height / img.width * w
  image(img, x, y, w, h)
}
function sprcelldraw(img, x, y, w, shape) {
  if (shape == "squ") {
    spritedraw(img, x, y, w)
  } else if (shape == "triup") {
  } else if (shape == "tridown") {
  } else if (shape == "hex") {
  }
}