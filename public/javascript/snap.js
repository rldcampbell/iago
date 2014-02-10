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
function chain(functionArray, interval) {
  var i = 0;
  functionArrayLength = functionArray.length;
  if (!(functionArrayLength > 0)) {
    return;
  }
  setInterval(function() {
    functionArray[i]();
    i += 1;
    if (!(i < functionArrayLength)) {
      clearInterval(this);
    }
  }, interval);
}
var directions = ["s", "sw", "nw", "n", "ne", "se"];
var p1color = "#0aa";
var p2color = "#a0a";
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
          fill: "#eee",
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
      hexObjects[i][j].snap.click(function(i, j) {
        return function() {
          var attempt = tryMove(i, j, "p1");
          console.log(attempt == null ? "illegal move for p1" : "legal move for p1 - " + attempt.count + " tile(s)");
        }
      }(i, j));
//      hexObjects[i][j].snap.click(function(i, j) {
//        return function() {
//          chain([function() {transformHexagon(5, 0, "s1,-1");}, function() {transformHexagon(5, 1, "s1,-1");}, function() {transformHexagon(5, 2, "s1,-1");}, function() {transformHexagon(5, 3, "s1,-1");}, function() {transformHexagon(5, 4, "s1,-1");}, function() {transformHexagon(5, 5, "s1,-1");}, function() {transformHexagon(5, 6, "s1,-1");}, function() {transformHexagon(5, 7, "s1,-1");}, function() {transformHexagon(5, 8, "s1,-1");}, function() {transformHexagon(5, 9, "s1,-1");}, function() {transformHexagon(5, 10, "s1,-1");}], 100);
//        }
//      }(i, j));
      
    }
  }
  
  function propogate(direction, startHex, history, player) {
    var nextHex = startHex[direction];
    if (nextHex == null || nextHex.state == null) {
      return [];
    }
    if (nextHex.state == player) {
      return history.length < 1 ? [] : history;
    }
    history.push(nextHex);
    return propogate(direction, nextHex, history, player);
  }
  
  function tryMove(i, j, player) {
    var startHex = hexObjects[i][j];
    if (startHex.state === null) {
      var forFlipping = [];
      var flipped = 0;
      for (i = 0; i < 6; i += 1) {
        forFlipping[i] = propogate(directions[i], startHex, [], player);
        flipped += forFlipping[i].length;
      }
      if (flipped > 0) {
        return {
          forFlipping: forFlipping,
          count: flipped
        };
      } 
    }
    return null;
  }
  
  var p1initial = [[1, -1], [2, -2], [3, 2], [3, 1], [1, 2], [2, 4], [-1, 2], [-2, 1], [-2, -1], [-4, -2], [-1, -3], [-2, -3]];
  var p2initial = [[1, -2], [2, -1], [2, 1], [4, 2], [2, 3], [1, 3], [-1, 1], [-2, 2], [-3, -1], [-3, -2], [-1, -2], [-2, -4]];
  for (k = 0; k < 12; k += 1) {
    var hex1 = hexObjects[r + p1initial[k][0]][r + p1initial[k][1]];
    var hex2 = hexObjects[r + p2initial[k][0]][r + p2initial[k][1]];
    hex1.snap.attr({fill: p1color});
    hex2.snap.attr({fill: p2color});
    hex1.state = "p1";
    hex2.state = "p2";
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