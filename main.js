$.getJSON('https://api.thingspeak.com/channels/950519/feeds.json?api_key=NHWOOIO02CQMDZ25&results=1', gotResults);

function gotResults(results) {
    document.getElementById("time-text").innerHTML = `${timeSince(results.feeds[0].created_at)} ago`;
    document.getElementById("depth-text").innerHTML = `${results.feeds[0].field3}L`;
    document.getElementById("water").style.height = `${results.feeds[0].field2}%`;
}

let DURATION_IN_SECONDS = {
    epochs: ['year', 'month', 'day', 'hour', 'minute'],
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60
};

function getDuration(seconds) {
    var epoch, interval;

    for (var i = 0; i < DURATION_IN_SECONDS.epochs.length; i++) {
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
    var seconds = Math.floor((new Date() - new Date(date)) / 1000);
    var duration = getDuration(seconds);
    var suffix = (duration.interval > 1 || duration.interval === 0) ? 's' : '';
    return duration.interval + ' ' + duration.epoch + suffix;
};