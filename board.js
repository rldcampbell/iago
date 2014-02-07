var a = [];
var r = 3;
var i = 0;
var j = 0;
var k = 0;
var iLimit = 1 + 2 * r;
var directions = ["n", "nw", "sw", "s", "se", "ne"];

function neighbours(i, j) {
    "use strict";
    return [[i, j + 1], [i - 1, j], [i - 1, j - 1], [i, j - 1], [i + 1, j], [i + 1, j + 1]];
}

for (i = 0; i < iLimit; i += 1) {
    a[i] = [];
    for (j = Math.max(0, i - r); j < Math.min(iLimit, i + r + 1); j += 1) {
        a[i][j] = {state: null, i: i, j: j};
    }
}
for (i = 0; i < iLimit; i += 1) {
    for (j = Math.max(0, i - r); j < Math.min(iLimit, i + r + 1); j += 1) {
        var hex = a[i][j];
        var nbs = neighbours(i, j);
        for (k = 0; k < 6; k += 1) {
            var nb = a[nbs[k][0]][nbs[k][1]];
            if (nb !== null) {
                hex[directions[k]] = nb;
            }
        }
    }
}