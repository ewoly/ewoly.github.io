function calculateWrappedLines(data, maxWidth) {
  const words = data.split(' ');
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

function drawwrappedtext(content, xpos, ypos, boxwidth, lineheight, align="left") {
  const lines = calculateWrappedLines(content, boxwidth);
  if (align == "center") {textAlign(CENTER)}
  for (let line of lines) {
    text(line, xpos, ypos);
    ypos += lineheight;
  }
  textAlign(LEFT)
}

function textHeight(data, maxWidth) {
  const lines = calculateWrappedLines(data, maxWidth);
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

function lodgetextsize(data, height, width) {
  textSize(1);
  let ratio = (textLeading() / height) / (textWidth(data) / width)
  if (ratio > 1) {
    return height / textLeading()
  } else {
    return width / textWidth(data)
  }
}

function linesplitting(data, linecount) {
  let words = data.split(" ")
  let threshhold = textWidth(data)/linecount
  let lines = []
  let lineofwords = []
  for (let i = 0; i < linecount-1; i++) {
    let thisline = words[0]
    let thislineofword = [words[0]]
    let within = true
    let n = 1
    while (within) {
      if (textWidth(thisline + " " + words[n]) <= threshhold) {
        thisline += " " + words[n]
        thislineofword.push(words[n])
        n += 1
      } else {within = false}
    }
    lines.push(thisline)
    lineofwords.push(thislineofword)
    words.splice(0, n)
  }
  let thisline = words[0]
  let thislineofword = [words[0]]
  for (let i = 1; i < words.length; i++) {
    thisline += " " + words[i]
    thislineofword.push(words[i])
  }
  lines.push(thisline)
  lineofwords.push(thislineofword)
  let widths = []
  for (let i = 0; i < linecount; i++) {
    widths.push(textWidth(lines[i]))
  }
  let iterate = true
  let minfound = threshhold*linecount
  let minlines = structuredClone(lineofwords)
  //console.log(lineofwords)
  while (iterate) {
    let maxval = Math.max.apply(Math, widths)
    if (minfound > maxval) {
      minfound = maxval
      minlines = structuredClone(lineofwords)
    }
    let target = widths.indexOf(maxval)
    //console.log(target)
    if (target == 0) {iterate = false}
    else {
      lineofwords[target-1].push(lineofwords[target][0])
      lineofwords[target].splice(0,1)
      widths[target-1] = textWidth(lineofwords[target-1].join(" "))
      widths[target] = textWidth(lineofwords[target].join(" "))
    }
  }
  return {lines: minlines, longest:minfound}
}

function advancedtextwrapping(data, xspace, yspace, linecount, maxsize) {
  textSize(10)
  let {lines, longest} = linesplitting(data, linecount)
  let size
  if (xspace * (linecount * textLeading()) < yspace * longest) {
    size = 10*xspace/longest
  } else {size = 10*yspace/(linecount*textLeading())}
  if (size > maxsize) {
    
  }
  return {size: size, lines: lines}
}

function advancedtextmono(data, xspace, yspace) {
  textSize(10);
  if (textLeading() * xspace > textWidth(data) * yspace) {
    return 10*yspace / textLeading()
  } else {return 10*xspace / textWidth(data)}
}

function drawadvancedtext(data, x, y, xspace, yspace, xalign, yalign, linecount = 1, maxsize = 999999) {
  textAlign(xalign, yalign)
  let printdata
  if (linecount <= 1) {
    textSize(advancedtextmono(data, xspace, yspace))
    printdata = data
  } else {
    let {size, lines} = advancedtextwrapping(data, xspace, yspace, linecount, maxsize)
    textSize(size)
    printdata = ""
    for (let i in lines) {
      printdata += lines[i].join(" ")
      if (i < lines.length-1) {printdata += "\n"}
    }
  }
  text(printdata, x, y)
}