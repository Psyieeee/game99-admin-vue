//百分数转化为小数
export const toPoint = function (percent) {
    var str = percent.replace('%', '')
    str = str / 100
    return str
}
//小数转化为百分数
export const toPercent = function (point) {
    if (point === undefined) {
        point = 0
    }
    const number = Number(point * 100)
    let str = 0
    if (number > 0) {
        str = number.toFixed(1)
    }
    return str + '%'
}

export const toFixed = function (number) {
    if (typeof (number) === 'undefined' || number == 0) {
        return 0
    }
    return number.toFixed(2)
}
