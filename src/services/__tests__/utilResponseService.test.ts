import { Response } from "express";
import {
    basicHttpResponce,
    basicHttpResponceIncludeData,
    internalServerErr,
} from "@/services/utilResponseService";

const mockRes: Partial<Response> = {
    status: jest.fn().mockImplementation(() => ({
        json: jest.fn(),
    })),
};

describe("internalServerErrのテスト", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("正常", () => {
        internalServerErr(mockRes as Response, "e");

        expect(mockRes.status).toHaveBeenCalledWith(500);
        const resStatus = (mockRes.status as jest.Mock).mock.results[0].value;
        expect(resStatus.json).toHaveBeenCalledWith({
            status: false,
            message: "e",
        });
    });
});

describe("basicHttpResponceのテスト", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("正常", () => {
        const httpStatus = 500;
        const status = false;
        const message = "basicHttpResponceのテスト";
        basicHttpResponce(mockRes as Response, httpStatus, status, message);

        expect(mockRes.status).toHaveBeenCalledWith(httpStatus);
        const resStatus = (mockRes.status as jest.Mock).mock.results[0].value;
        expect(resStatus.json).toHaveBeenCalledWith({
            status,
            message,
        });
    });
});

describe("basicHttpResponceIncludeDataのテスト", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("正常", () => {
        const httpStatus = 500;
        const status = false;
        const message = "basicHttpResponceIncludeDataのテスト";
        const data = {
            test: "test",
        };
        basicHttpResponceIncludeData(
            mockRes as Response,
            httpStatus,
            status,
            message,
            data
        );

        expect(mockRes.status).toHaveBeenCalledWith(httpStatus);
        const resStatus = (mockRes.status as jest.Mock).mock.results[0].value;
        expect(resStatus.json).toHaveBeenCalledWith({
            status,
            message,
            data,
        });
    });
});
