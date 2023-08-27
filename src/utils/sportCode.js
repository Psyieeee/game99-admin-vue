let key_value = {
  'trans_id': '注单编号',
  'vendor_member_id': '会员账号',
  'operator_id': '厂商 ID',
  'league_id': '联赛编号',
  'leaguename': '联赛名称',
  'name': '联赛或队伍名称',
  'match_id': '赛事编号',
  'home_id': '主队编号',
  'hometeamname': '主队名称',
  'away_id': '客队编号',
  'awayteamname': '客队名称',
  'team_id': '队伍编号',
  'game_id': '场次编号',
  'match_datetime': '赛事开球时间',
  'sport_type': '体育种类',
  'bet_type': '下注类型',
  'parlay_ref_no': '混合过关注单号码',
  'odds': '注单赔率',
  'stake': '会员投注金额',
  'transaction_time': '投注交易时间',
  'ticket_status': '注单状态',
  'winlost_amount': '盈亏金额',
  'after_amount': '有效下注金额',
  'currency': '币别',
  'winlost_datetime': '决胜时间',
  'odds_type': '赔率类型',
  'isLucky':'是否串关幸运',
  'odds_Info': '赔率信息',
  'bet_team': '下注对象',
  'exculding': '会员投注的正确比分不为列出的这些',
  'bet_tag': 'X与Y的值',
  'home_hdp': '主队让球/大小盘球头',
  'away_hdp': '客队让球/大小盘球头',
  'hdp': '让球/大小盘球头',
  'ou_hdp': '篮球总分大小盘球头',
  'betfrom': '下注平台表',
  'islive': '是否在滚球时下注',
  'home_score': '下注时主队得分',
  'home_score2': '当 bet_type=229 返回字段.注单未结算时返回数值为 0, 结算后返回投注,预测时间的赛果.',
  'away_score': '下注时客队得分',
  'away_score2': '当 bet_type=229 返回字段.注单未结算时返回数值为 0, 结算后返回投注,预测时间的赛果.',
  'settlement_time': '注单结算的时间',
  'customInfo1': '厂商备注1',
  'customInfo2': '厂商备注2',
  'customInfo3': '厂商备注3',
  'customInfo4': '厂商备注4',
  'customInfo5': '厂商备注5',
  'ba_status': '会员是否为BA状态',
  'esports_gameid': '电子竞技游戏类型. 当 sport_type=43 返回字段',
  'total_score': '总进球. 当 bet_type=228 返回字段.注单未结算时返回数值为 0, 结算后返回投注,预测时间的赛果',
  'version_key': '版本号',
  'ParlayData': '混合过关信息',
  'resettlementinfo': '重新结算信息(若有重新结算才会出现)',
  'ActionDate': '重新结算时间',
  'balancechange': '余额是否更动.(false 或 true)',
  'winlost': '前次结算输或赢的金额',
  'parlay_type':'串关类型',
  'gameCode':'游戏编号',
  'gameRound':'游戏局号',
  'begintime':'开始时间',
  'closetime':'结束时间',
  'dealer':'荷官名称',
  'gametype':'游戏类型',
  'playType':'玩法类型',
  'shoecode':'靴号',
  'flag':'结果状态',
  'bankerpoint':'庄分数',
  'playerpoint':'闲分数',
  'cardnum':'牌的张数',
  'pair':'对子结果',
  'dragonpoint':'龙点数',
  'tigerpoint':'虎点数',
  'cardlist':'牌结果描述',
  'vid':'视频ID',
  'platformtype':'平台类型'
}

let sport_type = {
  '1':'足球',
  '2':'篮球',
  '3':'美式足球',
  '4':'冰上曲棍球',
  '5':'网球',
  '6':'排球',
  '7':'斯诺克/台球',
  '8':'棒球',
  '9':'羽毛球',
  '10':'高尔夫球',
  '11':'赛车',
  '12':'游泳',
  '13':'政治',
  '14':'水球',
  '15':'跳水',
  '16':'拳击',
  '17':'射箭',
  '18':'乒乓球',
  '19':'举重',
  '20':'皮划艇',
  '21':'体操',
  '22':'田径',
  '23':'马术',
  '24':'手球',
  '25':'飞镖',
  '26':'橄榄球',
  '28':'曲棍球',
  '29':'冬季运动',
  '30':'壁球',
  '31':'娱乐',
  '32':'篮网球',
  '33':'自行车',
  '34':'击剑',
  '35':'柔道',
  '36':'现代五项',
  '37':'划船',
  '38':'帆船',
  '39':'射击',
  '40':'跆拳道',
  '41':'铁人三项',
  '42':'角力',
  '43':'电子竞技',
  '44':'泰拳',
  '45':'沙滩排球',
  '179':'310',
  '47':'卡巴迪',
  '48':'藤球',
  '49':'室内足球',
  '50':'板球',
  '51':'沙滩足球',
  '52':'扑克',
  '53':'国际象棋',
  '54':'奥林匹克',
  '55':'金融',
  '56':'乐透',
  '99':'其他'
}

let currency = {
  '2':'MYR(马元)',
  '3':'USD(美元)',
  '4':'THB(泰铢)',
  '6':'EUR(欧元)',
  '12':'GBP(英镑)',
  '13':'RMB(人民币)',
  '15':'IDR(印度尼西亚盾)',
  '20':'UUS(虚拟货币(测试环境使用))',
  '32':'JAP(日圆)',
  '41':'CHF(瑞士法郎)',
  '45':'WON(韩元)',
  '46':'BND(文莱元)',
  '49':'MXN(墨西哥比绍)',
  '50':'CAN(加币)',
  '51':'INH(VND)(越南盾)',
  '52':'DKK(丹麦克朗)',
  '53':'SEK(瑞典克朗)',
  '54':'NOK(挪威克朗)',
  '55':'RUB(卢布)',
  '56':'PLN(波兰兹罗提)',
  '57':'CZK(捷克克朗)',
  '58':'RON(罗马尼亚列伊)',
  '61':'INR(卢比)',
  '70':'MMK(MKK)(缅甸元)',
  '71':'KHR(柬埔寨瑞尔)',
  '73':'LIR(土耳其里拉)',
  '96':'USDT(USDT)',
  '97':'BDT(孟加拉国塔卡)'
}

let bet_type = {
  '1':'让球',
  '2':'单双盘',
  '3':'大小盘',
  '4':'波胆 (足球)',
  '5':'全场.独赢盘',
  '6':'总进球 (足球)',
  '7':'上半场让球',
  '8':'上半场大小盘',
  '10':'优胜冠军',
  '11':'总角球数 (足球)',
  '12':'上半场.单双盘',
  '13':'零失球 (足球)',
  '14':'最先进球/最后进球(足球)',
  '15':'上半场.独赢盘',
  '16':'半场.全场 (足球)',
  '17':'下半场让球 (足球)',
  '18':'下半场大小盘 (足球)',
  '19':'Substitutes',
  '20':'胜负盘',
  '21':'上半场胜负盘',
  '22':'得下一分 (足球)',
  '23':'下一角球',
  '24':'双重机会 (足球)',
  '25':'获胜球队 (足球)',
  '26':'双方/一方/两者皆不得分 (足球)',
  '27':'零失球的胜方 (足球)',
  '28':'三项让分投注 (足球)',
  '29':'串关 (其他)'
}

let ticket_status = {
  'waiting':'等待中',
  'running':'进行中',
  'void':'作废',
  'refund':'退款',
  'reject':'已取消',
  'lose':'输',
  'won':'赢',
  'draw':'和局',
  'half won':'半赢',
  'half lose':'半输'
}
let ba_status = {
  '1':'是',
  '0':'否'
}
let islive = {
  '1':'是',
  '0':'否'
}
let parlay_type = {
  'MixParlay':'混合过关',
  'System Parlay':'串关'
}
let flag = {
  '0':'无效',
  '1':'有效'
}
let pair = {
  '0':'没有对子',
  '1':'庄对',
  '2':'闲对',
  '3':'庄对闲对'
}

let betfrom = {
  'd':'亚洲版(已关闭) m 手机纯文字版',
  'l':'手机 h5 版 z 中国版',
  'x':'新亚洲版',
  'c':'手机轻量版',
  't':'快速连结',
  '1':'沙巴电竞桌机版',
  '2':'沙巴电竞手机版',
  '4':'沙巴电玩桌机版',
  '5':'沙巴电玩手机版'
}
export function messageCode(key) {
    return key_value[key]
}
export function messageVal(key,val){
  let result = val;
  if (val instanceof Array || val instanceof Object){
    result = JSON.stringify(val)
  }
  if (key == 'ticket_status'){
    result = ticket_status[val]
  }
  if (key == 'ba_status'){
    result = ba_status[val]
  }
  if (key == 'sport_type'){
    result = sport_type[val]
  }
  if (key == 'bet_type'){
    result = bet_type[val]
  }
  if (key == 'islive'){
    result = islive[val]
  }
  if (key == 'parlay_type'){
    result = parlay_type[val]
  }
  if (key == 'currency'){
    result = currency[val]
  }
  if (key == 'flag'){
    result = flag[val]
  }
  if (key == 'pair'){
    result = pair[val]
  }
  if (key == 'betfrom'){
    result = betfrom[val]
  }
  if (result == undefined){
    return '未知值['+val+']请查阅API文档'
  }
  return result
}
