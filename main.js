$.getJSON('https://api.thingspeak.com/channels/950519/feeds.json?api_key=NHWOOIO02CQMDZ25&results=1', gotResults);

function gotResults(results) {
    document.getElementById("depth-text").innerHTML = `${results.feeds[0].field3}L`;
    document.getElementById("water").style.height = `${results.feeds[0].field2}%`;
}