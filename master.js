let script;
let currentFile = null;

var buttons = {
    xwired: {x:0,y:0,dx:0,dy:0, func: startxwired, name: "Xwired"},
    ukonnect: {x:0,y:0,dx:0,dy:0, func: startukonnect, name: "UKonnect"},
}
function preload() { 
    document.title = "puxxles"
    usedfont = loadFont("Roboto-Medium.ttf") // WOO
    console.log("preload")
}
let originalGlobals = {};
function textHeight(based) {
    console.log("regress")
}
// Store all global properties before loading a new script
function captureGlobals() {
    originalGlobals = { ...window }; // Snapshot of existing global properties
}

// Load external script and track new functions
function loadScript(file) {
    if (script) {
        document.body.removeChild(script); // Remove previous script
    }

    captureGlobals(); // Save current global state

    script = document.createElement("script");
    script.src = file;
    script.onload = () => {
        console.log(`${file} loaded`);

        // Call xwired's preload/setup functions if they exist
        if (typeof window.preload === "function") window.preload();
        if (typeof window.setup === "function") window.setup();
    };
    
    document.body.appendChild(script);
    currentFile = file;
}
function unloadScript() {
    if (script) {
        if (typeof window.cleanupXwired === "function") {
            window.cleanupXwired(); // Call cleanup inside xwired.js
        }

        document.body.removeChild(script);
        script = null;
        currentFile = null;
        console.log("Script unloaded, returning to master.js");
        Object.keys(window).forEach((key) => {
            if (!(key in originalGlobals)) {
                console.log(`Removing ${key} from global scope`);
                try {
                    // Force removal of global function
                    if (typeof window[key] === "function") {
                        window[key] = undefined; // Nullify the function
                        delete window[key]; // Delete the function reference
                        console.log(`Removed function: ${key}`);
                    }
                } catch (error) {
                    console.warn(`Failed to delete ${key}`, error);
                }
            }
        });
        // List of p5.js interaction functions to disable
        const p5Functions = [
            "mousePressed", "mouseReleased", "mouseDragged", "mouseMoved", "mouseClicked",
            "keyPressed", "keyReleased", "keyTyped",
            "touchStarted", "touchMoved", "touchEnded"
        ];

        // Disable p5 functions by setting them to null
        p5Functions.forEach(func => {
            if (typeof window[func] === "function") {
                console.log(`Disabling ${func}`);
                window[func] = null;
            }
        });
        window.setup = setup;
        window.draw = draw;
        window.mousePressed = masterMousePressed; 
        setup(); // Reinitialize master.js
    }
}



var yes = true
/*
document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "o" && yes) {
        event.preventDefault();
        if (!currentFile) {
            loadScript("xwired.js");
            yes = false
        }
    }
});*/

function setup() {
    yes = true
    createCanvas(windowWidth, windowHeight);
    console.log("Master script activated");
}
function windowResized() {
    createCanvas(windowWidth, windowHeight);
}

function buttondisplay(boxwidth) {
    let h = 0
    for (let type in buttons) {
        buttons[type].x = windowWidth/2 - boxwidth/5
        buttons[type].dx = 2*boxwidth/5
        buttons[type].y = windowHeight/2 - 3*boxwidth/20 + h*boxwidth/5
        buttons[type].dy = boxwidth/10
        fill("#FFFFFF")
        stroke(0)
        strokeWeight(boxwidth/200)
        rect(buttons[type].x,buttons[type].y,buttons[type].dx,buttons[type].dy)
        textSize(boxwidth/20)
        noStroke()
        fill("#000000")
        textAlign(CENTER,CENTER)
        text(buttons[type].name, windowWidth/2, windowHeight/2 - boxwidth/10 + h*boxwidth/5)
        h++
    }
}

function draw() {
    background(220);
    buttondisplay(Math.min(windowWidth, windowHeight))
}

function startxwired() {
    if (!currentFile) {
        loadScript("xwired.js");
        yes = false
    }
}
function startukonnect() {
    if (!currentFile) {
        loadScript("ukonnect.js");
        yes = false
    }
}

function mousePressed() {
    console.log("Clickity", mouseX, mouseY)
    for (let button in buttons) {
        if (mouseX > buttons[button].x && mouseX < buttons[button].x + buttons[button].dx && mouseY > buttons[button].y && mouseY < buttons[button].y + buttons[button].dy) {
            console.log(button)
            buttons[button].func()
        }
    }
}