import _ from 'lodash'
import XLSX from 'xlsx'
import dateformat from 'dateformat'

function splitByCards(data) {
    let clearedData = _(data).filter(item => item.length > 0);
    let beginIndexes = clearedData.map((item, index) => [item, index]).filter(i => {
        let item = i[0]
        return item[0].includes('Карта № ') && item[0].includes('Статус:')
    }).map(it => it[1]).value();

    beginIndexes.push(clearedData.value().length)

    function pairwise(arr, func){
        let result = []
        for(var i=0; i < arr.length - 1; i++){
            result.push(func(arr[i], arr[i + 1]))
        }
        return result
    }

    return pairwise(beginIndexes, (start, end) => clearedData.slice(start, end).value())
}

function parseCardData(data) {
    let cardNum = data[0][0].match(/Карта № (\d+)/)[1]
    let startTransactionTable = _.findIndex(data, item => item[0] === 'Устройство')
    let endTransactionTable = _.findIndex(data, item => item[0].startsWith('Сумма дебетования кошелька :')) - 1
    let idx = _(data[startTransactionTable]).map((col, index) => {
        return {col: col.trim(), index: index}
    }).keyBy('col').mapValues('index').value()

    return _(data).slice(startTransactionTable + 1, endTransactionTable)
        .filter(row => row[idx['Тип транзакции']].trim() === 'Дебет')
        .map(row => {
        return {
            card: cardNum,
            location: row[idx['Устройство']],
            date: dateformat(row[idx['Дата транзакции']], 'yyyy.mm.dd HH:MM:ss'),
            fuelType: row[idx['Вид продукта']],
            volume: factualVolume(row[idx['Отпущено']]),
        }
    }).value()
}

function factualVolume(amount) {
    if (amount === undefined || (typeof amount === "string" && amount.trim() === '')) {
        return 0
    } else if(typeof amount == 'string') {
        return parseFloat(amount.trim().replace(',', '.'))
    } else {
        return amount
    }
}

function parse_file(content) {
    let wb = XLSX.read(content, {type:'binary', cellDates: true});
    let wsname = wb.SheetNames[0];
    let sheet = wb.Sheets[wsname];

    const data = XLSX.utils.sheet_to_json(sheet, {header:1});

    let cardRanges = splitByCards(data)
    let parsedData = _.map(cardRanges, parseCardData)

    return _.flatten(parsedData)
}

export default parse_file