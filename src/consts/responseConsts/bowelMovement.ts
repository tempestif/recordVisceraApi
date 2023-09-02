export const RECORD_BOWEL_MOVEMENT = {
    message: "排便記録を記録しました。"
} as const

export const READ_BOWEL_MOVEMENT = {
    message: "排便記録のリストを取得しました。"
} as const

export const BOWEL_MOVEMENT_NOT_FOUND = {
    message: "排便記録が見つかりません。"
} as const

export const BOWEL_MOVEMENT_ACCESS_FORBIDDEN = {
    message: "この排便記録は編集できません"
} as const

export const EDIT_BOWEL_MOVEMENT = {
    message: "排便記録を編集しました。"
} as const

export const DELETE_BOWEL_MOVEMENT = {
    message: "排便記録を削除しました。"
} as const

export const COUNT_BOWEL_MOVEMENT_PER_DAY = {
    message: "排便回数/日を集計しました。"
} as const

// TODO: 血の有無、粘液の有無のconstを作る。あり:1, なし:0