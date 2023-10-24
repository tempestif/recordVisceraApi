import createError from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

import { router as indexRouter } from "@/routes/index";
import { router as usersRouter } from "@/routes/users/index";
import { router as bowelMovementsRouter } from "@/routes/users/bowelMovements";
import { router as resetPasswordsRouter } from "@/routes/resetPasswords/index";
import { router as dailyReportsRouter } from "@/routes/users/dailyReports";
import { router as medicalHistoriesRouter } from "@/routes/users/medicalHistories";
import { router as settingsRouter } from "@/routes/users/settings";
import { router as profilesRouter } from "@/routes/users/profiles";
import { router as medicationsListsRouter } from "@/routes/users/medications/lists";
import { router as medicationsSchedulesRouter } from "@/routes/users/medications/schedules";
import { router as medicationslogsRouter } from "@/routes/users/medications/logs";
import { router as clinicsRouter } from "@/routes/users/clinics/index";
import { router as clinicsCheckupsRouter } from "@/routes/users/clinics/checkups";
import { router as clinicsNotesRouter } from "@/routes/users/clinics/notes";

const app = express();

// CORS設定
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL); // クライアントのオリジンを指定
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
  next();
});

// view engine setup
app.set("views", path.join("views"));//__dirNameと書いてある箇所を除く！
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join("public")));//__dirNameと書いてある箇所を除く！
app.use(express.static("public"));

app.use("/", indexRouter);
app.use("/reset-passwords", resetPasswordsRouter);
app.use("/users", usersRouter);
app.use("/users/bowel-movements", bowelMovementsRouter);
app.use("/users/daily-reports", dailyReportsRouter);
app.use("/users/medical-histories", medicalHistoriesRouter);
app.use("/users/settings", settingsRouter);
app.use("/users/profiles", profilesRouter);
app.use("/users/medications/lists", medicationsListsRouter);
app.use("/users/medications/schedules", medicationsSchedulesRouter);
app.use("/users/medications/logs", medicationslogsRouter);
app.use("/users/clinics", clinicsRouter);
app.use("/users/clinics/checkups", clinicsCheckupsRouter);
app.use("/users/clinics/notes", clinicsNotesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// ↓ 下のapp.use((err, req, res, next)=>{...})の引数errに付けるオブジェクトの型。
// errに付ける型として、vscode内のErrorというオブジェクト型があるが、statusというプロパティが無いため、拡張したinterfaceを定義している。
interface ErrorWithStatus extends Error {
  status: number;
}

// error handler
// ↓に関しては、このままだと全引数ともに暗黙的Anyとなってしまう。
// req,res,nextに関しては@types/expressの型を使えるが、errに関しては型拡張の必要あり！(上で定義したinterfaceを用いる。)
app.use(function (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;