import {
  FilterOptionsType,
  createFilterForPrisma,
  createSelectForPrisma,
  createSortsForPrisma,
} from "@/utils/dataTransfer";

describe("createFilterForPrismaのテスト", () => {
  test("正常", () => {
    const filterOptions: FilterOptionsType = {
      id: {
        data: "10",
        constructor: (i) => Number(i),
      },
      temp: {
        data: "36.5",
        constructor: (i) => Number(i),
      },
      weight: {
        data: "55.5",
        constructor: (i) => Number(i),
      },
      string: {
        data: "str",
        constructor: (i) => String(i),
      },
    };
    const result = createFilterForPrisma(filterOptions);

    const expectObj = {
      id: 10,
      temp: 36.5,
      weight: 55.5,
      string: "str",
    };

    expect(result).toEqual(expectObj);
  });

  test("dataの型がstringじゃない", () => {
    const filterOptions: FilterOptionsType = {
      id: {
        data: 10,
        constructor: (i) => Number(i),
      },
      temp: {
        data: 36.5,
        constructor: (i) => Number(i),
      },
      weight: {
        data: "55.5",
        constructor: (i) => Number(i),
      },
      string: {
        data: "str",
        constructor: (i) => String(i),
      },
    };

    const result = createFilterForPrisma(filterOptions);

    const expectObj = {
      weight: 55.5,
      string: "str",
    };

    expect(result).toEqual(expectObj);
  });
  test("引数がない", () => {
    const filterOptions: FilterOptionsType = {};

    const result = createFilterForPrisma(filterOptions);

    const expectObj = {};

    expect(result).toEqual(expectObj);
  });
});

describe("createSortsForPrismaのテスト", () => {
  test("正常", () => {
    const sort = "-str,images,-milk";

    const result = createSortsForPrisma(sort);
    const expectObj = [{ str: "desc" }, { images: "asc" }, { milk: "desc" }];

    expect(result).toEqual(expectObj);
  });

  test("引数なし -空文字", () => {
    const sort = "";

    const result = createSortsForPrisma(sort);
    const expectObj: { [key: string]: string }[] = [];

    expect(result).toEqual(expectObj);
  });

  test("引数なし -空文字", () => {
    const sort = undefined;

    const result = createSortsForPrisma(sort);
    const expectObj: { [key: string]: string }[] = [];

    expect(result).toEqual(expectObj);
  });
});

describe("createSelectForPrismaのテスト", () => {
  test("正常", () => {
    const fields = "milk,dog,hoge";
    const result = createSelectForPrisma(fields);
    const expectObj = {
      milk: true,
      dog: true,
      hoge: true,
    };

    expect(result).toEqual(expectObj);
  });

  test("指定なし", () => {
    const fields = "";
    const result = createSelectForPrisma(fields);
    const expectObj = {};

    expect(result).toEqual(expectObj);
  });

  test("引数なし", () => {
    const fields = undefined;
    const result = createSelectForPrisma(fields);
    const expectObj = {};

    expect(result).toEqual(expectObj);
  });
});
