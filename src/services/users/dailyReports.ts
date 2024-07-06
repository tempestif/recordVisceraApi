import { ERROR_DAILY_REPORT_NOT_FOUND } from "@/consts/responseMessages";
import { DbRecordNotFoundError } from "@/utils/errorHandle/errors";
import { transformNameTableToModel } from "@/utils/format";
import { customizedPrisma } from "@/utils/prismaClients";
import { Prisma } from "@prisma/client";
import {
  Args_2,
  DefaultArgs,
  DynamicModelExtensionThis,
} from "@prisma/client/runtime/library";

/**
 * DBより、今日の体調の存在確認、取得を行う。
 * 今日の体調が存在しなかった場合はDbRecordNotFoundErrorを投げる
 * NOTE: プロトタイプ用。現在のテーブル仕様では孫まで取る必要があると思われる。
 * @param where 検索条件
 * @param res
 * @returns
 */
export const findUniqueDailyReportAbsoluteExist = async (
  where: Prisma.Daily_ReportWhereUniqueInput,
  prismaClient: typeof customizedPrisma,
) => {
  // idから今日の体調を取得
  const dailyReportData = await prismaClient.daily_Report.findUnique({
    where,
  });
  // 今日の体調が無かったらDbRecordNotFoundErrorを投げる
  if (!dailyReportData) {
    const responseMsg = ERROR_DAILY_REPORT_NOT_FOUND.message;
    throw new DbRecordNotFoundError(responseMsg);
  }

  return dailyReportData;
};

export type RecordDataType = {
  temp?: number;
  weight?: number;
  stomachach?: number;
  condition?: number;
  arthritis?: number;
  skinLesitions?: number;
  ocularLesitions?: number;
  anorectalLesitions?: number;
  anirectalOtherLesitions?: number;
  abdominal?: number;
};

/**
 * daily_reportテーブルとそれに紐づく記録テーブルを作成する。
 * 記録が入力されていないテーブルも作成する。
 * @param userId ユーザーID
 * @param date 作成する記録のdate
 * @param recordData 記録内容
 */
export const createDailyReport = async (
  userId: number,
  date: Date,
  recordData: RecordDataType,
) => {
  // TODO: try-catchを実装する。
  // 今日の体調テーブルを作成
  const dailyReport = await customizedPrisma.daily_Report.create({
    data: {
      userId,
      day: date,
    },
  });
  const dailyReportId = dailyReport.id;

  // 紐づく記録テーブルを追加
  // 体温
  if (recordData.temp) {
    await createDailyReportRecordsTable(
      customizedPrisma.daily_report_Temp,
      dailyReportId,
      { result: recordData.temp },
    );
  }
  // 体重
  if (recordData.weight) {
    await createDailyReportRecordsTable(
      customizedPrisma.daily_report_Weight,
      dailyReportId,
      { result: recordData.weight },
    );
  }
  // 腹痛
  if (recordData.stomachach) {
    await createDailyReportRecordsTable(
      customizedPrisma.daily_report_Stomachache,
      dailyReportId,
      { stomachache_Scale_TypesId: recordData.stomachach },
    );
  }
  // 体調
  if (recordData.condition) {
    await createDailyReportRecordsTable(
      customizedPrisma.daily_report_Condition,
      dailyReportId,
      { condition_Scale_TypesId: recordData.condition },
    );
  }
  // 関節痛の有無
  if (recordData.arthritis) {
    await createDailyReportRecordsTable(
      customizedPrisma.daily_report_Arthritis,
      dailyReportId,
      { result: recordData.arthritis },
    );
  }
  // 皮膚病変の有無
  if (recordData.skinLesitions) {
    await createDailyReportRecordsTable(
      customizedPrisma.daily_report_Skin_Lesions,
      dailyReportId,
      { result: recordData.skinLesitions },
    );
  }
  // 眼病変の有無
  if (recordData.ocularLesitions) {
    await createDailyReportRecordsTable(
      customizedPrisma.daily_report_Ocular_Lesitions,
      dailyReportId,
      { result: recordData.ocularLesitions },
    );
  }
  // 肛門病変の有無
  if (recordData.anorectalLesitions) {
    await createDailyReportRecordsTable(
      customizedPrisma.daily_report_Anorectal_Lesitions,
      dailyReportId,
      {
        fistula: recordData.anorectalLesitions,
        others: recordData.anirectalOtherLesitions,
      },
    );
  }
  // 腹部腫瘤の有無
  if (recordData.abdominal) {
    await createDailyReportRecordsTable(
      customizedPrisma.daily_report_Abdominal,
      dailyReportId,
      { abdominal_Scale_TypesId: recordData.abdominal },
    );
  }

  // NOTE: ここでエラーが出たら取得できなかったという旨のものが投げられる。それでよい？
  // 返却用にもう一度daily_reportを取得。パフォーマンス悪すぎるなら他のやり方を考える
  const returnDailyReport =
    await customizedPrisma.daily_Report.findUniqueOrThrow({
      where: {
        id: dailyReportId,
      },
      include: {
        Temp: true,
        Weight: true,
        Stomachache: true,
        Condition: true,
        Arthritis: true,
        Skin_Lesions: true,
        Ocular_Lesitions: true,
        Anorectal_Lesitions: true,
        Abdominal: true,
      },
    });

  return returnDailyReport;
};

// レコード作成を行うテーブル名の文字列リテラル
type AcceptedTableNames = keyof Prisma.Daily_ReportInclude;
type PrismaTypeMap = Prisma.TypeMap<Args_2 & DefaultArgs>;

/**
 * テーブルを作成、dataの内容をレコードに記録する
 * @param prismaTable prismaClientのテーブル
 * @param dailyReportId 今日の体調のid
 * @param data レコードに記録する内容
 */
const createDailyReportRecordsTable = async (
  prismaTable: DynamicModelExtensionThis<
    PrismaTypeMap,
    AcceptedTableNames,
    DefaultArgs
  >,
  dailyReportId: number,
  data: any,
) => {
  await prismaTable.create({
    data: {
      dailyReportId,
      ...data,
    },
  });
};

export const updateDailyReport = async (
  dailyReportId: number,
  date: string,
  recordData: RecordDataType,
) => {
  const { include, data } = createUpdateData(date, recordData);
  const whereByDailyReportId = { id: dailyReportId };

  // テーブルの存在確認
  const dailyReport = await customizedPrisma.daily_Report.findUniqueOrThrow({
    where: whereByDailyReportId,
    include: DAILY_REPORT_ALL_INCLUDE,
  });

  // for...inに型アノテーションは含められないらしい。(https://github.com/microsoft/TypeScript/issues/3500)
  for (const table in DAILY_REPORT_ALL_INCLUDE) {
    const t = table as AcceptedTableNames;
    // テーブルがない && 更新内容に含まれているの場合、テーブルを作成
    if (dailyReport[t] === null && data[t]) {
      // テーブル名をモデル名に変更
      const prop = transformNameTableToModel(t);
      // @ts-ignore
      await customizedPrisma[prop].create({
        // @ts-ignore
        data: {
          ...data[t]?.update,
          dailyReportId,
        },
      });
    }
  }

  // 更新処理
  const newDailyReport = await customizedPrisma.daily_Report.update({
    where: whereByDailyReportId,
    data,
    include,
  });

  return newDailyReport;
};

/**
 * updateに使うデータを成型
 * @param date
 * @param temp
 * @param weight
 * @param stomachach
 * @param condition
 * @param arthritis
 * @param skinLesitions
 * @param ocularLesitions
 * @param anorectalLesitions
 * @param anirectalOtherLesitions
 * @param abdominal
 * @returns
 */
const createUpdateData = (date: string, recordData: RecordDataType) => {
  const data: Prisma.Daily_ReportUpdateInput = {};
  const include: Prisma.Daily_ReportInclude = {};
  if (date) {
    data.day = new Date(date);
  }
  if (recordData.temp) {
    data.Daily_report_Temp = {
      update: {
        result: Number(recordData.temp),
      },
    };
    include.Daily_report_Temp = true;
  }
  if (recordData.weight) {
    data.Daily_report_Weight = {
      update: {
        result: Number(recordData.weight),
      },
    };
    include.Daily_report_Weight = true;
  }
  if (recordData.stomachach) {
    data.Daily_report_Stomachache = {
      update: {
        stomachache_Scale_TypesId: Number(recordData.stomachach),
      },
    };
    include.Daily_report_Stomachache = true;
  }
  if (recordData.condition) {
    data.Daily_report_Condition = {
      update: {
        condition_Scale_TypesId: Number(recordData.condition),
      },
    };
    include.Daily_report_Condition = true;
  }
  if (recordData.arthritis) {
    data.Daily_report_Arthritis = {
      update: {
        result: Number(recordData.arthritis),
      },
    };
    include.Daily_report_Arthritis = true;
  }
  if (recordData.skinLesitions) {
    data.Daily_report_Skin_Lesions = {
      update: {
        result: Number(recordData.skinLesitions),
      },
    };
    include.Daily_report_Skin_Lesions = true;
  }
  if (recordData.ocularLesitions) {
    data.Daily_report_Ocular_Lesitions = {
      update: {
        result: Number(recordData.ocularLesitions),
      },
    };
    include.Daily_report_Ocular_Lesitions = true;
  }
  if (recordData.anorectalLesitions) {
    data.Daily_report_Anorectal_Lesitions = {
      update: {
        fistula: Number(recordData.anorectalLesitions),
      },
    };
    include.Daily_report_Anorectal_Lesitions = true;
  }
  if (recordData.anirectalOtherLesitions) {
    data.Daily_report_Anorectal_Lesitions = {
      update: {
        others: Number(recordData.anirectalOtherLesitions),
      },
    };
    include.Daily_report_Anorectal_Lesitions = true;
  }
  if (recordData.abdominal) {
    data.Daily_report_Abdominal = {
      update: {
        abdominal_Scale_TypesId: Number(recordData.abdominal),
      },
    };
    include.Daily_report_Abdominal = true;
  }

  return { data, include };
};

export const DAILY_REPORT_ALL_INCLUDE: Prisma.Daily_ReportInclude = {
  Daily_report_Temp: true,
  Daily_report_Weight: true,
  Daily_report_Stomachache: true,
  Daily_report_Condition: true,
  Daily_report_Arthritis: true,
  Daily_report_Skin_Lesions: true,
  Daily_report_Ocular_Lesitions: true,
  Daily_report_Anorectal_Lesitions: true,
  Daily_report_Abdominal: true,
  User: true,
} as const;
