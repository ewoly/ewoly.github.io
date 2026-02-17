function findtoday() {
  const d = new Date()
  util.today = {"d": d.getUTCDate(), "m": d.getUTCMonth() + 1, "y": d.getUTCFullYear()}
}

function shufflearray(array) {
  for (var i = array.length - 1; i >= 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function isAlphanumeric(str) {
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

function withinRange(val, max, min=0) {
  while (val >= max) {
    val -= (max-min)
  }
  while (val < min) {
    val += (max-min)
  }
  return val
}

function withinBound(val, max, min=0) {
  if (val > max) {return max}
  if (val < min) {return min}
  return val
}

function hasList(a,b){
  return a.some(x=>x.length===b.length&&x.every((v,i)=>v===b[i]))
}

function hasObject(list, obj) {
  return list.some(a =>
    Object.keys(obj).length === Object.keys(a).length &&
    Object.keys(obj).every(k => a[k] === obj[k])
  )
}
