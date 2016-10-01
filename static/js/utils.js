
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

// check if an element exists in array.
function inArray(array, value) {
    for(var i=0; i < array.length; i++) {
        if(array[i] == value) return true;
    }
    return false;
};

// adds an element to the array.
function pushIfNotExist(array, element) {
    if (!inArray(array, element)) {
        array.push(element);
    }
};

// remove element from array
Array.prototype.removeValue = function(value) {
    var index = this.indexOf(value);
    if (index > -1)
        this.splice(index, 1);
};


function redirectPost(location, args, csrf_token)
{
    var form = csrf_token;
    $.each(args, function(key, value) {
        form += '<textarea type="hidden" name="'+key+'">' + value + '</textarea>';
    });
    $('<form action="'+location+'" method="POST">'+form+'</form>').appendTo('body').submit();
}
