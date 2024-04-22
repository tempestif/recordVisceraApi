import { customizedPrisma } from "@/utils/prismaClients";

type CheckupType = {
  blood: boolean;
  mri: boolean;
  ct: boolean;
  custom: string[];
};

/**
 * clinic_Reportを作る。
 * この時、ユーザーが指定した検査も作成し紐づける
 * @param userId
 * @param date
 * @param checkups
 */
export const createClinicReport = async (
  userId: number,
  date: Date,
  checkups: CheckupType,
) => {
  // clinic_ReportをCheckup付で作り、そのcheckupIdから各検査を追加していく
  const newReport = await customizedPrisma.clinic_Report.create({
    data: {
      userId,
      date: date,
    },
    include: {
      Checkup: true,
    },
  });

  const checkupId = newReport.Checkup?.id;

  if (!checkupId) {
    throw Error;
  }

  // 血液検査追加
  if (checkups.blood) {
    await customizedPrisma.checkup_Blood.create({
      data: {
        checkupId,
      },
    });
  }

  // MRI追加
  if (checkups.mri) {
    await customizedPrisma.checkup_Mri.create({
      data: {
        checkupId,
      },
    });
  }

  // CT追加
  if (checkups.ct) {
    await customizedPrisma.checkup_Ct.create({
      data: {
        checkupId,
      },
    });
  }

  const clinicReportId = newReport.id;

  // note追加
  await customizedPrisma.clinic_Note.create({
    data: {
      clinicReportId,
    },
  });

  // NOTE: ここでエラーが出たら取得できなかったという旨のものが投げられる。それでよい？
  // 返却用にもう一度clinic_Reportを取得。パフォーマンス悪すぎるなら他のやり方を考える
  const returnClinicReport =
    await customizedPrisma.clinic_Report.findUniqueOrThrow({
      where: {
        id: clinicReportId,
      },
      include: {
        Checkup: true,
      },
    });

  return returnClinicReport;
};
