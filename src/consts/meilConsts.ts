export const TITLE_VALID_MAIL = {
    message: "[recordViscera]メールアドレス認証"
} as const

export const TEXT_VALID_MAIL = {
    message: (url: string) => `以下のURLをクリックしてください\n登録されたメールアドレスを確認します。\n${url}`
} as const