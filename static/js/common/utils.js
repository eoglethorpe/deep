
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
    var postForm = $('<form action="'+location+'" method="POST" hidden>'+form+'</form>');
    postForm.appendTo($('body'));
    postForm.submit();
}

function addTodayButtons() {
    var btns = $(".today-btn");
    if (btns)
        btns.remove();

    $('input[type="date"]').each(function() {
        var date = $(this);
        date.css('padding-left', '32px');
        var today_btn = $('<a class="today-btn"><i class="fa fa-circle"></i></a>');
        today_btn.appendTo(date.parent());
        today_btn.css('z-index', '10');
        date.css('position', 'relative');
        today_btn.css('position', 'absolute');
        today_btn.css('left', date.position().left+9+'px');
        today_btn.css('top', date.position().top+date.outerHeight()/2-10+'px');
        today_btn.css('cursor', 'pointer');

        today_btn.on('click', function(date) {
            return function(){
                date[0].valueAsDate = new Date();
                date.change();
            }
        }(date));
    });
}

$(document).ready(function(){
    addTodayButtons();
});



function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [day, month, year].join('-');
}

function formatTime(time) {
    var d = new Date(time),
        hr = '' + (d.getHours() + 1),
        min = '' + d.getMinutes(),
        sec = d.getSeconds();

    if (hr.length < 2) hr = '0' + hr;
    if (min.length < 2) min = '0' + min;
    if (sec.length < 2) sec = '0' + sec;

    return [hr, min].join(':') + "<span hidden>"+sec+"</span>";
}

function findMedian(values) {
    var vs = values.sort(function(a, b) { return a-b; });
    var m = Math.floor((vs.length-1)/2);
    if (m % 2)
        return (vs[m] + vs[m+1])/2;
    else
        return vs[m];
}

function getContrastYIQ(hexcolor){
    var r = parseInt(hexcolor.substr(1,2),16);
    var g = parseInt(hexcolor.substr(3,2),16);
    var b = parseInt(hexcolor.substr(5,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#212121' : '#fff';
}

// Search in a string and highlight the searched content with html
function searchAndHighlight(content, searchString) {
    var text = $('<div></div>').text(content).text();
    if (searchString.length > 0) {
        var index = text.toLowerCase().indexOf(searchString.toLowerCase());
        if (index >= 0) {
            return text.substr(0, index) + '<span style="background-color:#ff0">'
                + text.substr(index, searchString.length) + '</span>'
                + text.substr(index+searchString.length);
        }
    }
    return text;
}


// http://techblog.procurios.nl/k/news/view/33796/14863/calculate-iso-8601-week-and-year-in-javascript.html
/**
 * Get the ISO week date week number
 */
Date.prototype.getWeek = function () {
    // Create a copy of this date object
    var target  = new Date(this.valueOf());

    // ISO week date weeks start on monday
    // so correct the day number
    var dayNr   = (this.getDay() + 6) % 7;

    // ISO 8601 states that week 1 is the week
    // with the first thursday of that year.
    // Set the target date to the thursday in the target week
    target.setDate(target.getDate() - dayNr + 3);

    // Store the millisecond value of the target date
    var firstThursday = target.valueOf();

    // Set the target to the first thursday of the year
    // First set the target to january first
    target.setMonth(0, 1);
    // Not a thursday? Correct the date to the next thursday
    if (target.getDay() != 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }

    // The weeknumber is the number of weeks between the
    // first thursday of the year and the thursday in the target week
    return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
}

/**
* Get the ISO week date year number
*/
Date.prototype.getWeekYear = function ()
{
    // Create a new date object for the thursday of this week
    var target  = new Date(this.valueOf());
    target.setDate(target.getDate() - ((this.getDay() + 6) % 7) + 3);

    return target.getFullYear();
}

// http://stackoverflow.com/a/16591175/4328459
function getDateOfISOWeek(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}

// dd-mmm-yyyy
function getStupidDateFormat(date) {
    var dd = date.toLocaleString('en-us', {day: '2-digit'});
    var mmm = date.toLocaleString('en-us', {month: 'short'});
    var yyyy = date.toLocaleString('en-us', {year: 'numeric'});
    return dd + '-' + mmm + '-' + yyyy;
}

// Change formatted number to real number
function getNumberValue(element){
    if (!element.val())
        return "";
    return element.val().replace(/\s/g, '');
};

// formats number in 1 000 000 format
function formatNumber(numInput){
    var val = (('' + numInput.val()).replace(/\s/g, '')).split('').reverse().join('');

    var newVal = '';
    for(var i=0; i<val.length; i++){
        newVal += val.substr(i, 1);
        if(i%3 == 2){
            newVal += ' ';
        }
    }
    numInput.val(newVal.split('').reverse().join('').trim());
}



// Get minimum two digit string for an integer
function getTwoDigits(number) {
    return ('0' + number).slice(-2);
}

// Try reformatting a text
function reformatText(text) {
    text = text.replace(/\t/gi, ' ');
    text = text.replace(/[^\x00-\x7F]/g, "");
    text = text.replace(/([^\n])[ \t]*\n[ \t]*(?!\n)/gi, '$1 ');
    text = text.replace(/\n\s*\n\s*(\n\s*)+/gi, '\n\n\n');
    return text;
}
