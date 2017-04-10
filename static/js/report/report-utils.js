// fills number to element
function fillNumber(el, num) {
    if(!isNaN(num)){
        el.text(getFormattedNumber(num));
    }
}
// fills percent to element
function fillPercent(el, num) {
    if(!isNaN(num)){
        el.text(Math.round(num)+'%');
    }
}
function getHealthBar(health, tooltip) {
    if(health < 0){
        return $('<div class="health-bar-invalid"></div>');
    } else{
        var healthBar = $('<div class="health-bar" data-toggle="tooltip" title="'+tooltip+' ('+Math.round(health)+'%)'+'"></div>');
        var healthIndicator = $('<div class="health-indicator"></div>');
        healthIndicator.appendTo(healthBar);
        healthIndicator.css('width', health+'%');
        return healthBar;
    }
}
// returns appropriate icon according to change
function getChangeFa(num) {
    if(num > 0){
        return 'fa-arrow-up';
    } else if(num < 0){
        return 'fa-arrow-down';
    } else if(!isNaN(num)){
        return 'fa-arrow-right';
    }
}
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}
function describeArc(x, y, radius, startAngle, endAngle) {
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    return d;
}
function getAveragePercent(p1, p2, p3) {
    var sum = 0;
    if(p1 && p1 > 0) sum+=p1;
    if(p2 && p2 > 0) sum+=p2;
    if(p3 && p3 > 0) sum+=p3;
    return sum/3;
}

// format number to 1 000 format
function getFormattedNumber(num) {
    num = (num+'').replace(/\s/g, '').split('').reverse().join('')
    var newVal = '';
    for(var i=0; i<num.length; i++){
        newVal += num.substr(i, 1);
        if(i%3 == 2){
            newVal += ' ';
        }
    }
    return newVal.split('').reverse().join('');
}
