import {
    describe,
    expect,
    test,
} from "@jest/globals";
import { transformNameTableToModel } from "@/services/prismaService/format";

describe("transformNameTableToModelの単体テスト", () => {
    // テーブル名を全部ベタで書く。
    // NOTE: テーブルを追加したらテストも追加する
    test("Userをテスト", () => {
        const result = transformNameTableToModel("User");
        expect(result).toBe("user");
    });
    test("Profileをテスト", () => {
        const result = transformNameTableToModel("Profile");
        expect(result).toBe("profile");
    });
    test("User_Medical_Historyをテスト", () => {
        const result = transformNameTableToModel("User_Medical_History");
        expect(result).toBe("user_Medical_History");
    });
    test("User_Settingをテスト", () => {
        const result = transformNameTableToModel("User_Setting");
        expect(result).toBe("user_Setting");
    });
    test("Bowel_Movementをテスト", () => {
        const result = transformNameTableToModel("Bowel_Movement");
        expect(result).toBe("bowel_Movement");
    });
    test("Bristol_Stool_Scaleをテスト", () => {
        const result = transformNameTableToModel("Bristol_Stool_Scale");
        expect(result).toBe("bristol_Stool_Scale");
    });
    test("Daily_Reportをテスト", () => {
        const result = transformNameTableToModel("Daily_Report");
        expect(result).toBe("daily_Report");
    });
    test("Daily_report_Tempをテスト", () => {
        const result = transformNameTableToModel("Daily_report_Temp");
        expect(result).toBe("daily_report_Temp");
    });
    test("Daily_report_Weightをテスト", () => {
        const result = transformNameTableToModel("Daily_report_Weight");
        expect(result).toBe("daily_report_Weight");
    });
    test("Daily_report_Stomachacheをテスト", () => {
        const result = transformNameTableToModel("Daily_report_Stomachache");
        expect(result).toBe("daily_report_Stomachache");
    });
    test("Stomachache_Scale_Typesをテスト", () => {
        const result = transformNameTableToModel("Stomachache_Scale_Types");
        expect(result).toBe("stomachache_Scale_Types");
    });
    test("Daily_report_Conditionをテスト", () => {
        const result = transformNameTableToModel("Daily_report_Condition");
        expect(result).toBe("daily_report_Condition");
    });
    test("Condition_Scale_Typesをテスト", () => {
        const result = transformNameTableToModel("Condition_Scale_Types");
        expect(result).toBe("condition_Scale_Types");
    });
    test("Daily_report_Arthritisをテスト", () => {
        const result = transformNameTableToModel("Daily_report_Arthritis");
        expect(result).toBe("daily_report_Arthritis");
    });
    test("Daily_report_Skin_Lesionsをテスト", () => {
        const result = transformNameTableToModel("Daily_report_Skin_Lesions");
        expect(result).toBe("daily_report_Skin_Lesions");
    });
    test("Daily_report_Ocular_Lesitionsをテスト", () => {
        const result = transformNameTableToModel(
            "Daily_report_Ocular_Lesitions"
        );
        expect(result).toBe("daily_report_Ocular_Lesitions");
    });
    test("Daily_report_Anorectal_Lesitionsをテスト", () => {
        const result = transformNameTableToModel(
            "Daily_report_Anorectal_Lesitions"
        );
        expect(result).toBe("daily_report_Anorectal_Lesitions");
    });
    test("Daily_report_Abdominalをテスト", () => {
        const result = transformNameTableToModel("Daily_report_Abdominal");
        expect(result).toBe("daily_report_Abdominal");
    });
    test("Abdominal_Scale_Typesをテスト", () => {
        const result = transformNameTableToModel("Abdominal_Scale_Types");
        expect(result).toBe("abdominal_Scale_Types");
    });
    test("Clinic_Reportをテスト", () => {
        const result = transformNameTableToModel("Clinic_Report");
        expect(result).toBe("clinic_Report");
    });
    test("Checkupをテスト", () => {
        const result = transformNameTableToModel("Checkup");
        expect(result).toBe("checkup");
    });
    test("Checkup_Bloodをテスト", () => {
        const result = transformNameTableToModel("Checkup_Blood");
        expect(result).toBe("checkup_Blood");
    });
    test("Checkup_Blood_Additionalをテスト", () => {
        const result = transformNameTableToModel("Checkup_Blood_Additional");
        expect(result).toBe("checkup_Blood_Additional");
    });
    test("Checkup_Mriをテスト", () => {
        const result = transformNameTableToModel("Checkup_Mri");
        expect(result).toBe("checkup_Mri");
    });
    test("Checkup_Ctをテスト", () => {
        const result = transformNameTableToModel("Checkup_Ct");
        expect(result).toBe("checkup_Ct");
    });
    test("Checkup_Customをテスト", () => {
        const result = transformNameTableToModel("Checkup_Custom");
        expect(result).toBe("checkup_Custom");
    });
    test("Clinic_Noteをテスト", () => {
        const result = transformNameTableToModel("Clinic_Note");
        expect(result).toBe("clinic_Note");
    });
    test("Medication_Info_Userをテスト", () => {
        const result = transformNameTableToModel("Medication_Info_User");
        expect(result).toBe("medication_Info_User");
    });
    test("Medication_Info_Masterをテスト", () => {
        const result = transformNameTableToModel("Medication_Info_Master");
        expect(result).toBe("medication_Info_Master");
    });
    test("Medication_Scheduleをテスト", () => {
        const result = transformNameTableToModel("Medication_Schedule");
        expect(result).toBe("medication_Schedule");
    });
    test("Medication_Timing_Typesをテスト", () => {
        const result = transformNameTableToModel("Medication_Timing_Types");
        expect(result).toBe("medication_Timing_Types");
    });
    test("Medication_Resultをテスト", () => {
        const result = transformNameTableToModel("Medication_Result");
        expect(result).toBe("medication_Result");
    });
});
