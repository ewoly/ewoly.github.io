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

function randomintlist(length, min, max, total) {
  let values = []

  for (let i = 0; i < length; i++) {
    values.push(min)
  }

  let remaining = total - min * length

  while (remaining > 0) {
    let possible = []

    for (let i = 0; i < length; i++) {
      if (values[i] < max) {
        possible.push(i)
      }
    }

    let index = possible[seedrandint(0, possible.length - 1)]
    values[index]++
    remaining--
  }

  return values
}

function weightrand(min, max, targetval, strength) {
  let total = 0
  let weights = []
  for (let i = min; i <= max; i++) {
    let dist = Math.abs(i - targetval)
    let weight = 1 / (1 + dist * strength)
    weights.push(weight)
    total += weight
  }
  let pick = seedrandint(0, total * 1000000 - 1) / 1000000
  for (let i = 0; i < weights.length; i++) {
    pick -= weights[i]
    if (pick < 0) {
      return min + i
    }
  }
  return max
}