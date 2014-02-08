var socket = io.connect();
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
  function coordinatesToPosition(i, j, d) {
      return [d * 3 * i / 4, d * (2 * j - i) * Math.sqrt(3) / 4];
  }
  function randomColor() {
    return "#" + ("00000" + Math.floor(Math.random() * 256 * 256 * 256).toString(16)).slice(-6);
  }
  var i, j, r = 5, spacing = 75, hexWidth = 60, color = randomColor();
  var iLimit = 1 + 2 * r;
  var xOffset = svgCanvas.width / 2 - (r * spacing * 3 / 4);
  var yOffset = spacing * (r + 1) * Math.sqrt(3) / 4;
  var hex = [];
  for (i = 0; i < iLimit; i += 1) {
    hex[i] = [];
    for (j = Math.max(0, i - r); j < Math.min(iLimit, i + r + 1); j += 1) {
      var pos = coordinatesToPosition(i, j, spacing);
      hex[i][j] = hexagon(pos[0] + xOffset, pos[1] + yOffset, hexWidth).attr({fill: color, stroke: "#000", strokeWidth: 5});
      hex[i][j].mouseover(function(i, j, thishexagon) {
        return function() {
          socket.emit('flip', {"i": i, "j": j});
          thishexagon.attr({transform: "r30r-30"});
          thishexagon.animate({transform: "r30s-1,1r-30"}, 500);
        }
      }(i, j, hex[i][j]));
    }
  }
  
  socket.on('flip', function(data) {
    hex[data.i][data.j].attr({transform: "r30r-30"});
    hex[data.i][data.j].animate({transform: "r30s-1,1r-30"}, 500);
  });
}