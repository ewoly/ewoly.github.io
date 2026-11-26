function findtoday() {
  const d = new Date()
  util.today = {"d": d.getUTCDate(), "m": d.getUTCMonth() + 1, "y": d.getUTCFullYear()}
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
