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