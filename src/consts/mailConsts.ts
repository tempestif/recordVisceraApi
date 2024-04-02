export const TITLE_VALID_MAIL = {
    message: "[recordViscera]メールアドレス認証",
} as const;

export const TEXT_VALID_MAIL = {
    message: (url: string) =>
        `以下のURLをクリックしてください\n登録されたメールアドレスを確認します。\n${url}`,
} as const;

export const TITLE_VALID_RESET_PASS = {
    message: "[recordViscera]メールアドレス認証",
} as const;

export const TEXT_VALID_RESET_PASS = {
    message: (url: string) =>
        `以下のURLをクリックしてください\n登録されたメールアドレスを確認します。\n${url}`,
} as const;

export const BAD_REQUEST = {
    message: "不正なリクエストです",
} as const;
