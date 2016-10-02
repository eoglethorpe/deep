
var map = L.map('the-map').setView([27.7, 85.3], 6);
L.tileLayer('https://data.humdata.org/crisis-tiles/{z}/{x}/{y}.png').addTo(map);
