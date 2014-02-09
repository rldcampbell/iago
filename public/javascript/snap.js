var socket = io.connect();
function coordinatesToPosition(i, j, d) {
  return [d * 3 * i / 4, d * (2 * j - i) * Math.sqrt(3) / 4];
}
function randomColor() {
  return "#" + ("00000" + Math.floor(Math.random() * 256 * 256 * 256).toString(16)).slice(-6);
}
function neighbours(i, j) {
  return [[i, j + 1], [i - 1, j], [i - 1, j - 1], [i, j - 1], [i + 1, j], [i + 1, j + 1]];
}
var directions = ["s", "sw", "nw", "n", "ne", "se"];
window.onload = function() {
  var svgCanvas = {
    height: 1000,
    width: 1000
  };
  var s = Snap(svgCanvas.width, svgCanvas.height);
  function hexagon(x, y, d) {
    var alpha = Math.sqrt(3) * d / 4;
    return s.polygon([x - d/2, y, x - d/4, y + alpha, x + d/4, y + alpha, x + d/2, y, x + d/4, y - alpha, x - d/4, y - alpha]);
  }
  function transformHexagon(i, j, tString) {
    hexObjects[i][j].snap.attr({transform: "r1r-1"});
    hexObjects[i][j].snap.animate({transform: tString}, 500);
  }
  var i, j, k, r = 5, spacing = 75, hexWidth = 60, color = randomColor();
  var iLimit = 1 + 2 * r;
  var xOffset = svgCanvas.width / 2 - (r * spacing * 3 / 4);
  var yOffset = spacing * (r + 1) * Math.sqrt(3) / 4;
  var hexObjects = [];
  var transformStrings = ["s1,-1", "r60s1,-1r-60", "r-60s1,-1r60"];
  
  for (i = 0; i < iLimit; i += 1) {
    hexObjects[i] = [];
    for (j = Math.max(0, i - r); j < Math.min(iLimit, i + r + 1); j += 1) {
      var pos = coordinatesToPosition(i, j, spacing);
      hexObjects[i][j] = {
        snap: hexagon(pos[0] + xOffset, pos[1] + yOffset, hexWidth).attr({
          fill: color, 
          stroke: "#000", 
          strokeWidth: 5
        }),
        state: null,
        i: i,
        j: j
      };
      hexObjects[i][j].snap.mouseover(function(i, j) {
        return function() {
          socket.emit('flip', {"i": i, "j": j});
          transformHexagon(i, j, transformStrings[Math.floor(3 * Math.random())]);
        }
      }(i, j));
    }
  }
  
  for (i = 0; i < iLimit; i += 1) {
    for (j = Math.max(0, i - r); j < Math.min(iLimit, i + r + 1); j += 1) {
      var nbs = neighbours(i, j);
      var currentHexObject = hexObjects[i][j];
      for (k = 0; k < 6; k += 1) {
        if (undefined != hexObjects[nbs[k][0]] && undefined != hexObjects[nbs[k][0]][nbs[k][1]]) {
          currentHexObject[directions[k]] = hexObjects[nbs[k][0]][nbs[k][1]];
        }
      }
    }
  }
  
  socket.on('flip', function(data) {
    transformHexagon(data.i, data.j, transformStrings[Math.floor(3 * Math.random())]);
  });
}