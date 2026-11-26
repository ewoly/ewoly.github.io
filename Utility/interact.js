function pointinpolygon(px, py, vertices) {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        let xi = vertices[i][0], yi = vertices[i][1];
        let xj = vertices[j][0], yj = vertices[j][1];

        let intersect = ((yi > py) != (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
        if (intersect) {inside = !inside};
    }
    return inside;
    }
function detectbutton(x, y) {
    for (let butkey in ui.button) {
        let but = ui.button[butkey]
        if (Object.hasOwn(but, "avail")) {
        if (!ui.clickable[but.avail]) {continue}
        }
        if (x >= but.x && x <= but.x+but.dx) {
        if (y >= but.y && y <= but.y+but.dy) {
            return [but.func, but.type, but]
        }
        }
    }
    return [null, false]
}

function detectslider(x, y) {
    for (let slidkey in ui.slider) {
        let slid = ui.slider[slidkey]
        let xbeginregion = slid.x + ((slid.dx - slid.w) * slid.adj.n / (slid.max - slid.min))
        if (x >= xbeginregion && x <= xbeginregion + slid.w) {
        if (y >= slid.y && y <= slid.y + slid.dy) {
            return [true, slidkey]
        }
        }
    }
    return [null]
}