var createError = require("http-errors");
var express = require("express");
const { exec } = require("child_process");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var topico01Router = require("./routes/topico01");

var app = express();

app.use(express.static(path.join(__dirname, "views")));

app.post("/run", express.json(), (req, res) => {
  const { code, input } = req.body;
  if (!code) {
    return res.status(400).send("Código Python não fornecido");
  }

  // Salva o código Python em um arquivo temporário
  const fs = require("fs");
  const tempCodePath = path.join(__dirname, "temp_code.py");
  fs.writeFile(tempCodePath, code, (err) => {
    if (err) return res.status(500).send("Erro ao salvar o código");

    // Executa o código Python com a entrada fornecida
    const pythonProcess = exec(`python ${tempCodePath}`);

    // Envia a entrada ao processo Python
    pythonProcess.stdin.write(input);
    pythonProcess.stdin.end();

    // Captura a saída do processo Python
    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data;
    });
    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data;
    });

    // Quando o processo termina, envia a saída ao cliente
    pythonProcess.on("close", () => {
      // Remove o arquivo temporário
      fs.unlink(tempCodePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Erro ao remover o arquivo temporário:", unlinkErr);
        }
      });

      // Se houver erros, envie uma mensagem personalizada
      if (errorOutput) {
        // Mensagem de erro mais limpa
        const cleanedErrorOutput = errorOutput.trim(); // Remove espaços desnecessários
        res.status(400).send("Há erros no código!");
      } else {
        res.send(output);
      }
    });
  });
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/topicos/topico01", topico01Router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
