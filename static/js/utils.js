
// Use default values for pastel color.
function getColor(brightness=100, saturation=87.5) {
    var hue = Math.floor(Math.random() * 360);
    var color = 'hsl(' + hue + ', ' + brightness + '%, ' + saturation + '%)';
    return color;
}


String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
