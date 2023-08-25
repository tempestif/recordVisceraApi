import express from "express";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// DBのuserを読む、書く
router.get("/test", function (req, res, next) {
  res.status(200).json({
    "status": true,
    "message": "dekitayo"
  });
});

router.post("/testpost", async (req, res, next) => {
  const { email, name } = req.body

  console.log(email, name)

  try {
    // emailが被ってるか確認
    // const result = await prisma.user.findUnique({
    //   where: {
    //     email: email
    //   }
    // })
    // console.log(result)

    // // 追加
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
      },
    })

    // レスポンス
    res.status(200).json({
      "status": true,
      "message": "post dekitayo",
      // "result": result
    });
  }
  catch (e) {
    // 怒りのレスポンス
    res.status(500).json({
      "status": false,
      "message": e,
    });
  }
});

export { router };