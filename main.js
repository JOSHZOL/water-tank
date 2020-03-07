let graphItem = document.querySelector('#template').content.querySelector('.graph-item');

let results;
let waterDepth = 0;
let numberOfTanks = 2;

(function getData() {
    $.getJSON('https://api.thingspeak.com/channels/950519/fields/1.json?api_key=NHWOOIO02CQMDZ25&results=10', gotResults);
    setTimeout(getData, 30000);
})();

function gotResults(data) {
    results = data;
    waterDepthValues();
    let values = calculateValues(waterDepth);
    updateHtml(values.litres, values.percentage);
}

function waterDepthValues() {
    let depths = [];

    for (let i = 0; i < results.feeds.length; i++) {
        depths.push(results.feeds[i].field1);
    }

    waterDepth = median(depths);
}

function calculateValues(depth) {
    let percentage, litres; 

    percentage = depth / 218;
    litres = ((Math.PI * (1.8 * 1.8) * 2.18) * percentage) * 10;
    litres = Math.floor(litres);
    litres *= 100;
    litres *= numberOfTanks;
    percentage *= 100;
    percentage = Math.round(percentage);

    return {
        litres: litres,
        percentage: percentage
    }
}

function updateHtml(litres, percentage) {
    document.getElementById("depth-text").innerHTML = `${litres}L`;
    document.getElementById("water").style.height = `${percentage}%`;
}

(function setTime() {
    if (typeof(results) != 'undefined') {
        document.getElementById("time-text").innerHTML = timeSince(results.feeds[results.feeds.length - 1].created_at);
        setTimeout(setTime, 1000);
        return;
    }

    setTimeout(setTime, 100);
})();

(function getDailyData() {
    let date = new Date(Date.now());
    date.setDate(date.getDate() - 1);
    
    let year = new Intl.DateTimeFormat('en-NZ', { year: 'numeric' }).format(date);
    let month = new Intl.DateTimeFormat('en-NZ', { month: '2-digit' }).format(date);
    let day = new Intl.DateTimeFormat('en-NZ', { day: '2-digit' }).format(date);

    let end = ('end='+year+'-'+month+'-'+day+'%2023:59:59');

    date.setDate(date.getDate() - 8);

    year = new Intl.DateTimeFormat('en-NZ', { year: 'numeric' }).format(date);
    month = new Intl.DateTimeFormat('en-NZ', { month: '2-digit' }).format(date);
    day = new Intl.DateTimeFormat('en-NZ', { day: '2-digit' }).format(date);

    let start = ('start='+year+'-'+month+'-'+day+'%2000:00:00');
     
    $.getJSON(`https://api.thingspeak.com/channels/950519/fields/1.json?api_key=NHWOOIO02CQMDZ25&${start}&${end}&timezone=Pacific%2FAuckland&median=daily`, gotDailyResults);
})();

function gotDailyResults(data) {
    for (let i = data.feeds.length - 7; i < data.feeds.length; i++) {
        let values = calculateValues(data.feeds[i].field1);

        let date = new Intl.DateTimeFormat('en-NZ', {
            weekday: 'short'
        }).format(new Date(data.feeds[i].created_at));

        if (date[0] == 'S' || date[0] == 'T') {
            date = date[0] + date[1]; 
        }
        else {
            date = date[0];
        }

        AddGraphItem(date, values.litres, values.percentage);
    }
}

function AddGraphItem(date, litres, percentage) {
    let node = document.importNode(graphItem, true);
    let nodeWater = node.querySelector('.graph-item-water');
    let nodeDay = node.querySelector('.graph-item-day');
    nodeDay.innerHTML = date;
    document.getElementById("graph").appendChild(node);
    setTimeout(() => { nodeWater.style.height = `calc(75% * ${percentage / 100})` }, 10);
}

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