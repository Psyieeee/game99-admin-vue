// 日期格式化
export function parseTime(time, pattern) {
    if (arguments.length === 0 || !time) {
        return null
    }
    const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
    let date
    if (typeof time === 'object') {
        date = time
    } else {
        if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
            time = parseInt(time)
        } else if (typeof time === 'string') {
            time = time.replace(new RegExp(/-/gm), '/')
        }
        if ((typeof time === 'number') && (time.toString().length === 10)) {
            time = time * 1000
        }
        date = new Date(time)
    }
    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
    }
    return format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key]
        // Note: getDay() returns 0 on Sunday
        if (key === 'a') {
            return ['日', '一', '二', '三', '四', '五', '六'][value]
        }
        if (result.length > 0 && value < 10) {
            value = '0' + value
        }
        return value || 0
    })
}

export function getDefaultTime() {
    const startTime = new Date(new Date().setHours(0, 0, 0, 0))
    const endTime = new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000 - 1)
    return [startTime, endTime]
}

export function getDefaultLastWeekTime() {
    const startTime = new Date(get7beforeDay().setHours(0, 0, 0, 0))
    const endTime = new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000 - 1)
    return [startTime, endTime]
}

// 获取今天开始时间
export function getTodayStartTime() {
    return getDateStartTime(new Date())
}

// 获取今天开始时间
export function getMeiDongTodayStartTime() {
    const date = new Date()
    return new Date(date.toLocaleDateString("zh-cn") + ' 12:00:00')
}

// 获取今天结束时间
export function getMeiDongTodayEndTime() {
    const date = new Date()
    date.setTime(date.getTime() + 3600 * 1000 * 24)
    return new Date(date.toLocaleDateString("zh-cn") + ' 11:59:59')
}

// 获取今天结束时间
export function getTodayEndTime() {
    return getDateEndTime(new Date())
}

// 获取指定日期的开始时间
export function getDateStartTime(date) {
    return new Date(date.toLocaleDateString("zh-cn"))
}

// 获取指定日期的结束时间
export function getDateEndTime(date) {
    return new Date(date.toLocaleDateString("zh-cn") + ' 23:59:59')
}

export function getYesterDate() {
    const date = new Date()
    date.setTime(date.getTime() - 3600 * 1000 * 24)
    return date;
}

export function getYesterDateStart() {
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24)
    return parseTime(getDateStartTime(start), '{y}-{m}-{d} {h}:{i}:{s}');
}

export function getYesterDateEnd() {
    const end = new Date()
    end.setTime(end.getTime() - 3600 * 1000 * 24)
    return parseTime(getDateEndTime(end), '{y}-{m}-{d} {h}:{i}:{s}');
}

export function get7beforeDay() {
    const date = new Date()
    date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
    return date;
}

// 添加日期范围
export function addDateRange(params, dateRange, propName) {
    let search = params;
    search.params = typeof (search.params) === 'object' && search.params !== null && !Array.isArray(search.params) ? search.params : {};
    dateRange = Array.isArray(dateRange) ? dateRange : [];
    if (typeof (propName) === 'undefined') {
        search.params['beginTime'] = dateRange[0];
        search.params['endTime'] = dateRange[1];
    } else {
        search.params['begin' + propName] = dateRange[0];
        search.params['end' + propName] = dateRange[1];
    }
    return search;
}

export const pickerDateTimeShortcuts = [{
    text: '今日',
    value: () => {
        const end = new Date()
        const start = new Date()
        return [getDateStartTime(start), getDateEndTime(end)]
    }
}, {
    text: '昨日',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24)
        end.setTime(end.getTime() - 3600 * 1000 * 24)
        return [getDateStartTime(start), getDateEndTime(end)]
    }
}, {
    text: '本周',
    value: () => {
        const end = new Date()
        const start = new Date()
        const weekday = start.getDay() || 7;
        start.setDate(start.getDate() - weekday + 1);
        return [getDateStartTime(start), getDateEndTime(end)]
    }
}, {
    text: '本月',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(1);
        return [getDateStartTime(start), getDateEndTime(end)]
    }
}, {
    text: '昨日到今日',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24)
        return [getDateStartTime(start), getDateEndTime(end)]
    }
}, {
    text: '最近一周',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        return [getDateStartTime(start), getDateEndTime(end)]
    }
}, {
    text: '最近半个月',
    value: () => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 15);
        return [getDateStartTime(start), getDateEndTime(end)];
    }
}, {
    text: '最近一个月',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        return [getDateStartTime(start), getDateEndTime(end)]
    }
}, {
    text: '最近两个月',
    value: () => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 61);
        return [getDateStartTime(start), getDateEndTime(end)];
    }
}, {
    text: '最近三个月',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
        return [getDateStartTime(start), getDateEndTime(end)]
    }
}, {
    text: '最近半年',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 183)
        return [getDateStartTime(start), getDateEndTime(end)]
    }
}, {
    text: '最近一年',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
        return [getDateStartTime(start), getDateEndTime(end)]
    }
}]

export const pickerDateShortcuts = [{
    text: '今日',
    value: () => {
        const end = new Date()
        const start = new Date()
        return [start, end]
    }
}, {
    text: '昨日',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24)
        end.setTime(end.getTime() - 3600 * 1000 * 24)
        return [start, end]
    }
}, {
    text: '本周',
    value: () => {
        const end = new Date()
        const start = new Date()
        const weekday = start.getDay() || 7;
        start.setDate(start.getDate() - weekday + 1);
        return [start, end]
    }
}, {
    text: '本月',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(1);
        return [start, end]
    }
}, {
    text: '昨日到今日',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24)
        return [start, end]
    }
}, {
    text: '最近一周',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        return [start, end]
    }
}, {
    text: '最近半个月',
    value: () => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 15);
        return [start, end];
    }
}, {
    text: '最近一个月',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        return [start, end]
    }
}, {
    text: '最近两个月',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 60)
        return [start, end]
    }
}, {
    text: '最近三个月',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
        return [start, end]
    }
}]

export const toyesDayshortcuts = [{
    text: '今天',
    value: () => {
        return new Date();
    }
}, {
    text: '昨天',
    value: () => {
        const date = new Date();
        date.setTime(date.getTime() - 3600 * 1000 * 24);
        return date
    }
}, {
    text: '前天',
    value: () => {
        const date = new Date();
        date.setTime(date.getTime() - 3600 * 1000 * 48);
        return date
    }
}]

export const pickerDateTimeMeiDong = [{
    text: '今日',
    value: () => {
        const start = new Date()
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000 * 24)
        return [new Date(start.toLocaleDateString("zh-cn") + ' 12:00:00'), new Date(end.toLocaleDateString("zh-cn") + ' 11:59:59')]
    }
}, {
    text: '昨日',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24)
        return [new Date(start.toLocaleDateString("zh-cn") + ' 12:00:00'), new Date(end.toLocaleDateString("zh-cn") + ' 11:59:59')]
    }
}, {
    text: '前天',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 48)
        end.setTime(end.getTime() - 3600 * 1000 * 24)
        return [new Date(start.toLocaleDateString("zh-cn") + ' 12:00:00'), new Date(end.toLocaleDateString("zh-cn") + ' 11:59:59')]
    }
}]
