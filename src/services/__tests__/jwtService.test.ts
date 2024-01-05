import { generateAuthToken } from "@/services/jwtService";
import { sign } from "jsonwebtoken";

jest.mock("jsonwebtoken", () => ({
    ...jest.requireActual("jsonwebtoken"),
    sign: jest.fn(),
}));

describe("generateAuthTokenのテスト", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("正常", () => {
        const mockToken = "mockToken";
        (sign as jest.Mock).mockReturnValue(mockToken);

        // テスト実行
        const id = 10;
        const result = generateAuthToken(id);

        expect(result).toBe(mockToken);
    });

    test("PrivateKeyがない", () => {
        // JWTPRIVATEKEYをmock化
        const originalEnvVar = process.env.JWTPRIVATEKEY;
        process.env.JWTPRIVATEKEY = "";

        const id = 10;
        try {
            // テスト実行
            expect(() => {
                generateAuthToken(id);
            }).toThrow("generateAuthToken: 環境変数が足りません");
        } finally {
            // 環境変数を元に戻す
            process.env.JWTPRIVATEKEY = originalEnvVar;
        }
    });
});
