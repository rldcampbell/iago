var socket = io.connect();
window.onload = function() {
  var s = Snap(960, 400);
  function hexagon(x, y, d) {
    var alpha = Math.sqrt(3) * d / 4;
    return s.polygon([x - d/2, y, x - d/4, y + alpha, x + d/4, y + alpha, x + d/2, y, x + d/4, y - alpha, x - d/4, y - alpha]);
  }
  var hex = hexagon(200, 200, 100).attr({fill: "#bada55", stroke: "#000", strokeWidth: 5});
  
  socket.on('toggle', function() {
    if (hex.attr("fill") == "#bada55") {
      hex.attr({transform: "r30r-30"})
      hex.animate({transform: "r30s-1,1r-30", fill: "#ba0000"}, 500);
    }
    else {
      hex.animate({transform: "r30s1,1r-30", fill: "#bada55"}, 500);
    }
  });
  
  hex.click(hexClick);
  function hexClick() {
    socket.emit('toggle');
  }
}