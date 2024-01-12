import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export * from "./users";
export * from "./temps";
export * from "./profiles";
export * from "./weights";
export * from "./dailyReports";

/**
 * DBから対象のレコードが見つからない
 * エラーメッセージはインスタンス化する時に引数として設定する
 */
export class DbRecordNotFoundError extends Error {
    constructor(...args: any[]) {
        super(...args);

        // this.name = this.constructor.name; でも問題ないが、
        // enumerable を false にしたほうがビルトインエラーに近づく、
        Object.defineProperty(this, "name", {
            configurable: true,
            enumerable: false,
            value: this.constructor.name,
            writable: true,
        });

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DbRecordNotFoundError);
        }
    }

    // NOTE: 独自のunique関数をfindUniqueOrThrowに変更中のための一時的な処置
    // instanceofで比較した際の挙動を変更する
    // findUniqueOrThrowで投げられるエラーでもinstanceofでtrueを返すようにしておく。
    static [Symbol.hasInstance](e: unknown) {
        if (!e || typeof e !== "object") {
            return false;
        }

        // 該当のインスタンスかどうかを確認
        // プロトタイプチェーンを手動でチェック
        const isDbRecordNotFoundError = Object.prototype.isPrototypeOf.call(
            DbRecordNotFoundError.prototype,
            e
        );
        const isPrismaClientKnownRequestError =
            PrismaClientKnownRequestError &&
            Object.prototype.isPrototypeOf.call(
                PrismaClientKnownRequestError.prototype,
                e
            );

        // DbRecordNotFoundErrorかPrismaClientKnownRequestErrorをinstanceof演算子で比較したらtrueを返す
        if (isDbRecordNotFoundError || isPrismaClientKnownRequestError) {
            return true;
        }

        return false;
    }
}

/**
 * アクティブユーザーが複数いる
 */
export class MultipleActiveUserError extends Error {
    constructor(...args: any[]) {
        super(...args);

        Object.defineProperty(this, "name", {
            configurable: true,
            enumerable: false,
            value: this.constructor.name,
            writable: true,
        });

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, MultipleActiveUserError);
        }
    }
}

/**
 * 認証トークンが見つからない
 */
export class TokenNotFoundError extends Error {
    constructor(...args: any[]) {
        super(...args);

        Object.defineProperty(this, "name", {
            configurable: true,
            enumerable: false,
            value: this.constructor.name,
            writable: true,
        });

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, MultipleActiveUserError);
        }
    }
}

/**
 * 不正なリクエストを受け取った
 */
export class BadRequestError extends Error {
    constructor(...args: any[]) {
        super(...args);

        Object.defineProperty(this, "name", {
            configurable: true,
            enumerable: false,
            value: this.constructor.name,
            writable: true,
        });

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BadRequestError);
        }
    }
}
