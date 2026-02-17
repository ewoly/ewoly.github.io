function playsfx(sfxname, pitch = 1) {
  sfxname.setVolume(aud.sfxvol.n**2/3500)
  sfxname.rate(pitch)
  sfxname.play()
}

function musichandler() {
  let p = aud.musicplayer
  let lib = aud.muslib
  if (p.current == null) {return}
  if (lib[p.current].isPlaying()) {
    lib[p.current].setVolume(aud.musvol.n**2 * p.effectvol / 10000)
  } else { // loop
    if (p.queue.indexOf(p.current) >= p.queue.length-1) {
      p.current = p.queue[0]
    } else {
      p.current = p.queue[p.queue.indexOf(p.current)+1]
    }
    if (lib[p.current].isLoaded()) {lib[p.current].setVolume(aud.musvol.n**2 * p.effectvol / 10000); lib[p.current].play()}
  }
}
