function randint(min, max) {
  return floor(random()*(max-min)+min);
}

function processseedrand(s, min, max) {
  let a = (s ^ 0xdeadbeef) >>> 0
  let b = (s * 2654435761) >>> 0
  a = (a + 0x6d2b79f5) >>> 0
  let t = a ^ (a >>> 15)
  t = (t * (1 | b)) >>> 0
  t = t ^ (t + ((t ^ (t >>> 7)) * 61))
  t = (t ^ (t >>> 14)) >>> 0
  let v = t % (max - min + 1)
  return min + v
}

function seedrandint(min, max) {
  util.seed += 1
  return processseedrand(util.seed, min, max)
}