import { type Request, type Response, type NextFunction } from "express"
import { customizedPrisma } from "@/services/prismaClients"
import { sendMail } from "@/services/nodemailerService"
import { compare } from "bcrypt"
import { basicHttpResponce, basicHttpResponceIncludeData, internalServerErr } from "@/services/utilResponseService"
import { findUniqueBowelMovementAbsoluteExist } from "@/services/prismaService/bowelMovements"
import { COMPLETE_GET_PROFILE, COMPLETE_UPDATE_PASSWORD, WRONG_LOGIN_INFO } from "@/consts/responseConsts"
import { findUniqueUserAbsoluteExist } from "@/services/prismaService"
import { CustomLogger, LoggingObjType, maskConfInfoInReqBody } from "@/services/LoggerService"
import { PROCESS_FAILURE, PROCESS_SUCCESS } from "@/consts/logConsts"
import { ErrorHandleIncludeDbRecordNotFound } from "@/services/errorHandlingService"
import { BRISTOL_STOOL_SCALES } from "@/consts/db/bristolStoolScales"
import { PrismaPromise_2 } from "@prisma/client/runtime/library"
import { Prisma } from "@prisma/client"
const logger = new CustomLogger()

/**
 * メール送信テスト
 * TODO: 本番前に消す
 */
export const sendMailTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // メールを送信
        const mail = process.env.MAIL_ACCOUNT ?? ""
        await sendMail(mail, "test", "test mail")

        // レスポンス
        res.status(200).json({
            "status": true,
            "message": "[テスト]メールを送信しました。",
        });
    } catch (e) {
        // エラーの時のレスポンス
        internalServerErr(res, e)
    }
}

/**
 * tokenのuserIdからユーザー情報を取得
 * @param req userId
 * @param res id, email, name, createdAt, updatedAt
 * @param next
 * @returns
 */
export const readUser = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: バリデーション
    const { userId } = req.body

    // logのために関数名を取得
    const currentFuncName = readUser.name
    try {
        // userIdでユーザーを取得
        const whereByUserId = { id: userId }
        const user = await findUniqueUserAbsoluteExist(whereByUserId, res)

        // レスポンスを返却
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = COMPLETE_GET_PROFILE.message
        // password, authCode, verified以外を返却する。
        const { id, email, name, createdAt, updatedAt } = user
        const respondUser = {
            id,
            email,
            name,
            createdAt,
            updatedAt
        }
        basicHttpResponceIncludeData(res, HttpStatus, responseStatus, responseMsg, respondUser)

        // ログを出力
        const logBody: LoggingObjType = {
            userId: userId,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(HttpStatus),
            responseMsg
        }
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody)
    } catch (e: unknown) {
        ErrorHandleIncludeDbRecordNotFound(e, userId, req, res, currentFuncName)
    }
}

/**
 * ユーザーパスワードを変更
 * 現在のパスワードが合致していたら新パスワードを更新
 * @param req
 * @param res
 * @param next
 */
export const changePassowrd = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, oldPassword, newPassword } = req.body

    // logのために関数名を取得
    const currentFuncName = changePassowrd.name
    // TODO: バリデーション
    try {
        // userIdでユーザーを取得
        const whereByUserId = { id: userId }
        const user = await findUniqueUserAbsoluteExist(whereByUserId, res)

        // 旧パスワードの一致を確認
        const isValidPassword = await compare(oldPassword, user.password)
        // 合致しなかったら401エラー
        if (!isValidPassword) {
            const HttpStatus = 401
            const responseStatus = false
            const responseMsg = WRONG_LOGIN_INFO.message
            basicHttpResponce(res, HttpStatus, responseStatus, responseMsg)

            // ログを出力
            const logBody: LoggingObjType = {
                userId,
                ipAddress: req.ip,
                method: req.method,
                path: req.originalUrl,
                body: maskConfInfoInReqBody(req).body,
                status: String(HttpStatus),
                responseMsg
            }
            logger.error(PROCESS_FAILURE.message(currentFuncName), logBody)

            return
        }

        // パスワードを更新
        const newUser = await customizedPrisma.user.update({
            where: whereByUserId,
            data: {
                password: newPassword
            }
        })

        // レスポンスを返却
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = COMPLETE_UPDATE_PASSWORD.message
        const { id, email, name, createdAt, updatedAt } = newUser
        const respondUser = {
            id,
            email,
            name,
            createdAt,
            updatedAt
        }
        basicHttpResponceIncludeData(res, HttpStatus, responseStatus, responseMsg, respondUser)

        // ログを出力
        const logBody: LoggingObjType = {
            userId,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(HttpStatus),
            responseMsg
        }
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody)
    } catch (e) {
        ErrorHandleIncludeDbRecordNotFound(e, userId, req, res, currentFuncName)
    }
}


/**
 * CDAI算出
 * @param req userId, bristolStoolScale, blood, drainage, note, date
 * @param res
 * @param next
 * @returns
 */
export const readCdai = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body

    // logのために関数名を取得
    const currentFuncName = readCdai.name
    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {

        // 1. userIdで直近1週間分のbowelMovementsを取得
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const bowelMovementData = await customizedPrisma.bowel_Movement.findMany({//TODO 変数名変える
            where: {
                userId,
                day: {
                    gte: oneWeekAgo
                },
            }
        })

        // 2. 水様便、泥状便の数をカウント
        const filteredBowelMovementData = bowelMovementData.filter((obj: Prisma.$Bowel_MovementPayload['scalars']) => { obj.bristolStoolScale >= BRISTOL_STOOL_SCALES.mudLike })
        const mudOrWaterLikePooCount = filteredBowelMovementData.length

        // 3. userIdからuser_medical_historyを取得
        const medicalHistoryData = await customizedPrisma.user_Medical_History.findMany({//TODO 変数名変える
            where: {
                userId,
            }
        })

        // 4. userIdから直近1週間分のdaily_report_stomachacheを取得
        const dailyReport = await customizedPrisma.daily_Report.findMany({//TODO 変数名変える
            where: {
                userId,
                day: {
                    gte: oneWeekAgo
                },
            },
            include: {
                Daily_report_Temp: true,
                Daily_report_Weight: true,
                Daily_report_Stomachache: true,
                Daily_report_Condition: true,
                Daily_report_Arthritis: true,
                Daily_report_SkinLesions: true,
                Daily_report_OcularLesitions: true,
                Daily_report_Anorectal_Lesitions: true,
                Daily_report_Abdominal: true,
            }
        })

        // 5. 腹痛のスコアを合計
        let stomachachesScore = 0
        let conditionsScore = 0
        dailyReport.map((obj) => {
            return {
                stomachacheScaleId: obj.Daily_report_Stomachache?.result,
                conditionScaleId: obj.Daily_report_Condition?.conditionScaleId
            }
        }).forEach(async (obj) => {
            const stomachacheScaleTypes = await customizedPrisma.stomachache_Scale_Types.findUnique({
                where: {
                    id: obj.stomachacheScaleId
                }
            })
            stomachachesScore += stomachacheScaleTypes?.score ?? 0
            
            const conditionScaleTypes = await customizedPrisma.condition_Scale_Types.findUnique({
                where: {
                    id: obj.conditionScaleId
                }
            })
            conditionsScore += conditionScaleTypes?.score ?? 0

        })




        // 6. userIdから直近1週間分のdaily_report_conditionを取得



        // 7. 体調のスコアを合計
        // 8. userIdでdaily_report_arthritis, daily_report_skin_lesions, daily_report_ocular_lesions, daily_report_anorectal_lesionsのそれぞれの項目の有無を取得
        // 9. userIdで直近3回分のmedication_resultを取得
        // 10. ロペラミドorオピアトの仕様有無を取得
        // 11. userIdで最新のcheckup_bloodのhematocritを取得
        // 12. userIdでprofilesのsex, heightを取得
        // 13. ヘマトクリット値のスコアを算出
        //     - 男性：47 - ヘマトクリット値
        //     - 女性：42 - ヘマトクリット値
        // 14. userIdでdaily_report_weightのresultを取得
        // 15. 標準体重を算出
        //     - 100 × ( 1 - 体重/ (身長m)² ×22 )
        // 16. CDAIを算出

        //     詳細は[別タスク](https://www.notion.so/1f478f9636e647438cb13087689f7787?pvs=21)

        // 17. CDAIによって重症度を算出

        //     軽症: 150 - 220

        //     中等症: 221-450

        //     重症: 451-

        // 18. レスポンス返却

        //     HttpStatus
        //     responseStatus
        //     responseMsg

        //     cdai

        //     重症度のテキスト



        // dateをDate型に変換
        let dateForDb
        if (!date) {
            // dateが指定なしの場合、現在日時を入力
            dateForDb = new Date()
        } else {
            // dateが指定されていた場合、指定のdate
            dateForDb = new Date(date)
        }

        // 排便記録を追加
        const bowelMovementDataeeee = await customizedPrisma.bowel_Movement.create({
            data: {
                userId,
                day: dateForDb,
                time: dateForDb,
                blood,
                drainage,
                note,
                bristolStoolScale
            }
        })

        // レスポンスを返却
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = RECORD_BOWEL_MOVEMENT.message
        basicHttpResponceIncludeData(res, HttpStatus, responseStatus, responseMsg, bowelMovementData)

        // ログを出力
        const logBody: LoggingObjType = {
            userId,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(HttpStatus),
            responseMsg
        }
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody)
    } catch (e) {
        ErrorHandleIncludeDbRecordNotFound(e, userId, req, res, currentFuncName)
    }
}