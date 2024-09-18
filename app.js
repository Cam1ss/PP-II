require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const session = require("express-session");
const { exec } = require("child_process");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const saltRounds = 10;
var app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }),
);

const dbcobralingo = new sqlite3.Database("./cobralingo.db", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conectado ao banco de dados!!");
  }
});

dbcobralingo.serialize(() => {
  dbcobralingo.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    )`);
});

var indexRouter = require("./routes/index");
var cadastroRouter = require("./routes/cadastro");
var usersRouter = require("./routes/users");
var topico01Router = require("./routes/topico01");
var topico02Router = require("./routes/topico02");
var topico03Router = require("./routes/topico03");
var topico04Router = require("./routes/topico04");
var topico05Router = require("./routes/topico05");
var aboutUsRouter = require("./routes/aboutUs");
var conteudoRouter = require("./routes/conteudo");
var menuRouter = require("./routes/menu");
var perfilRouter = require("./routes/perfil");

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
        // Mensagem de erro
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

app.post("/register", (req, res) => {
  const { username, password, confirmPassword } = req.body;

  // Verifique se as senhas coincidem
  if (password !== confirmPassword) {
    return res.status(400).render("As senhas não coincidem!");
  }

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      return res.status(500).send("Erro ao criar hash da senha!");
    }

    const stmt = dbcobralingo.prepare(
      "INSERT INTO users (username, password) VALUES (?, ?)",
    );
    stmt.run(username, hash, function (err) {
      if (err) {
        console.error("Erro ao cadastrar usuário:", err.message);
        return res
          .status(500)
          .send(`Erro ao cadastrar usuário: ${err.message}`);
      }
      res.send(`
        <html>
        <head>
        </head>
        <body>
            <p>Cadastro realizado!</p>
        </body>
        </html>
    `);
    });
    stmt.finalize();
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  console.log("Request Body:", req.body);

  dbcobralingo.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, row) => {
      if (err) {
        return res.status(500).send("Erro ao verificar usuário!");
      }

      if (row) {
        bcrypt.compare(password, row.password, (err, result) => {
          if (err) {
            return res.status(500).send("Erro ao comparar senha!");
          }

          console.log("Password Match:", result);

          if (result) {
            req.session.username = username;
            res.redirect("/menu");
          } else {
            res.status(401).send("Usuário ou senha inválidos!");
          }
        });
      } else {
        res.status(401).send("Usuário ou senha inválidos!");
      }
    },
  );
});

app.get("/user", (req, res) => {
  if (req.session.username) {
    res.json({ username: req.session.username });
  } else {
    res.status(401).send("Não autenticado");
  }
});

app.use("/", indexRouter);
app.use("/cadastro", cadastroRouter);
app.use("/users", usersRouter);
app.use("/topicos/topico01", topico01Router);
app.use("/topicos/topico02", topico02Router);
app.use("/topicos/topico03", topico03Router);
app.use("/topicos/topico04", topico04Router);
app.use("/topicos/topico05", topico05Router);
app.use("/aboutUs", aboutUsRouter);
app.use("/topicos", conteudoRouter);
app.use("/menu", menuRouter);
app.use("/perfil", perfilRouter);

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
