export type FilterOptionsType = {
    [key: string]: {
        data: any,
        constructor: (i: string) => any
    }
}

/**
 * filterOptionsから、データがstring(=paramsにデータが素材する)のフィールドだけオブジェクトにして返す
 * filterOptionsのコンストラクタを用いてキャストも行う
 * @param filterOptions フィルターの値と型のコンストラクタ
 * @returns
 */
export const createFilterForPrisma = (filterOptions: FilterOptionsType) => {
    // フィルターとして指定されたフィールドだけ、適するオブジェクトに変換してfilterに追加
    const filter: { [key: string]: any } = {};
    Object.keys(filterOptions).forEach(key => {
        // クエリから受け取った値
        const data = filterOptions[key].data
        // 値をfilterOptionsで設定したオブジェクトに変換したもの
        const objForFilter = filterOptions[key].constructor(filterOptions[key].data)
        if (typeof data === 'string') filter[key] = objForFilter
    })
    return filter
}

/**
 * paramsから渡されたソートの情報をPrismaのorderByで使えるオブジェクトに変換する
 * カンマ区切りで配列化、先頭に"-"があればdesc, 無ければascとして扱う
 * @param sort paramsから渡されたsort
 * @returns
 */
export const createSortsForPrisma = (sort: string | undefined) => {
    // 指定されたソートの内容をprismaに渡せるように成型
    const sorts: { [key: string]: string }[] = []
    sort?.split(',').forEach(s => {
        if (s[0] === '-') {
            const property = s.slice(1)
            sorts.push({
                [property]: 'desc'
            })
        } else {
            sorts.push({
                [s]: 'asc'
            })
        }
    })
    return sorts
}

/**
 * 取得したDBのデータをフィルターする
 * @param fields 必要なフィールド
 * @param DbObj DBのデータ
 * @returns
 */
export const filteringFields = (fields: string | undefined, DbObj: { [key: string]: any }) => {
    // 指定されたフィールドを抽出
    const fieldAry = fields?.split(',')
    const filteredObj = DbObj.map((temp: { [key: string]: any }) => {
        let ret

        if (!fieldAry?.length) {
            // 指定なしの場合は全フィールド返す
            ret = temp
        } else {
            // retに必要なフィールドだけ格納
            const filteredTemp: { [key: string]: any } = {}
            fieldAry.forEach(field => {
                const tempField = temp[field]
                if (tempField) filteredTemp[field] = tempField
            })
            ret = filteredTemp
        }
        return ret
    })

    return filteredObj
}
