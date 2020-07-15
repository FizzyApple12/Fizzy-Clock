const { ipcRenderer } = require('electron')
const vue = new Vue({
    el: '#vueapp',
    data: {
        time: new Date(),
        weekdays: [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
        ],
        months: [
            'january',
            'feburary',
            'march',
            'april',
            'may',
            'june',
            'july',
            'augest',
            'september',
            'october',
            'november',
            'december'
        ],
        alarms: [
            
        ]
    }
});

const saveAlarms = () => {
    console.log('saved')
    ipcRenderer.send('savealarms', vue.alarms);
}

ipcRenderer.send('loadalarms', null);

setInterval(() => {
    vue.time = new Date();

    for (var alarm in vue.alarms) {
        if (!cronMatch(vue.time, vue.alarms[alarm].time)) continue;
        ipcRenderer.send('alarm', vue.alarms[alarm]);
    }
}, 1000);

const cronMatch = (time, cron) => {
    var timeSegs = cron.split(" ");

    if ((timeSegs[0] != '*' && parseInt(timeSegs[0]) != time.getSeconds()) ||
        (timeSegs[1] != '*' && parseInt(timeSegs[1]) != time.getMinutes()) ||
        (timeSegs[2] != '*' && parseInt(timeSegs[2]) != time.getHours()) ||
        (timeSegs[3] != '*' && parseInt(timeSegs[3]) != time.getDate()) ||
        (timeSegs[4] != '*' && parseInt(timeSegs[4]) != time.getMonth()) ||
        (timeSegs[5] != '*' && parseInt(timeSegs[5]) != time.getFullYear())) return false;

    return true;
}

const addAlarm = () => {
    vue.alarms.push({
        time: `0 ${vue.time.getMinutes()} ${vue.time.getHours()} * * *`,
        description: "",
        sound: "Sunny.mp3"
    });
    saveAlarms();
}

const removeAlarm = (i) => {
    vue.alarms.splice(i, 1);
    saveAlarms();
}

ipcRenderer.on('loadalarms_cb', (event, args) => {
    vue.alarms = args;
});