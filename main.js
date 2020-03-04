let results;
let waterDepth = 0;
let waterPercentage = 0;
let waterLitres = 0;
let numberOfTanks = 2;

(function getData() {
    $.getJSON('https://api.thingspeak.com/channels/950519/fields/1.json?api_key=NHWOOIO02CQMDZ25&results=10', gotResults);
    setTimeout(getData, 30000);
})();

function gotResults(data) {
    results = data;
    waterDepthValues();
    calculateValues();
    updateHtml();
}

function waterDepthValues() {
    let depths = [];

    for (let i = 0; i < results.feeds.length; i++) {
        depths.push(results.feeds[i].field1);
    }

    waterDepth = median(depths);
}

function calculateValues() {
    waterPercentage = (waterDepth / 218);
    waterLitres = ((Math.PI * (1.8 * 1.8) * 2.18) * waterPercentage) * 10;
    waterLitres = Math.floor(waterLitres);
    waterLitres *= 100;
    waterLitres *= numberOfTanks;
    waterPercentage *= 100;
}

function updateHtml() {
    document.getElementById("depth-text").innerHTML = `${waterLitres}L`;
    document.getElementById("water").style.height = `${waterPercentage}%`;
}

(function setTime() {
    if (typeof(results) != 'undefined') {
        document.getElementById("time-text").innerHTML = timeSince(results.feeds[results.feeds.length - 1].created_at);
    }
    
    setTimeout(setTime, 1000);
})();

let DURATION_IN_SECONDS = {
    epochs: ['day', 'hour', 'minute'],
    day: 86400,
    hour: 3600,
    minute: 60
};

function getDuration(seconds) {
    let epoch;
    let interval;

    for (let i = 0; i < DURATION_IN_SECONDS.epochs.length; i++) {
        epoch = DURATION_IN_SECONDS.epochs[i];
        interval = Math.floor(seconds / DURATION_IN_SECONDS[epoch]);
        if (interval >= 1) {
            return {
                interval: interval,
                epoch: epoch
            };
        }
    }
};

function timeSince(date) {
    let seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let duration = getDuration(seconds);

    if (typeof(duration) != 'undefined') {
        let suffix = (duration.interval > 1 || duration.interval === 0) ? 's' : '';
        return duration.interval + ' ' + duration.epoch + suffix + ' ago';
    } else {
        return 'A moment ago';
    }
};

function median(numbers) {
    let median = 0; 
    let numsLen = numbers.length;
    numbers.sort();
 
    if (numsLen % 2 === 0) { // is even
        // average of two middle numbers
        median = (parseInt(numbers[(numsLen / 2) - 1]) + parseInt(numbers[(numsLen / 2)])) / 2;
    } else { // is odd
        // middle number only
        median = numbers[(numsLen - 1) / 2];
    }
 
    return median;
}