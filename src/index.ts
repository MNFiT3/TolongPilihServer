import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import routes from "./routes";
import * as path from "path";
import { mobile } from "./middlewares/mobile";

const PORT =  process.env.PORT || 3001
const webURL = "web";
const whitelist = ['null', null, undefined]

//Connects to the Database -> then starts the express
createConnection()
  .then(async connection => {
    // Create a new express application instance
    const app = express();

    var corsOptions = {
      origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      }
    }
    app.use(cors(corsOptions));

    // Call midlewares
    app.use(helmet());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.get("/", (req, res) => {
      var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      res.status(301).redirect(fullUrl + webURL)
    })

    if(process.env.NODE_ENV.trim() === "production"){
      app.use('/' + webURL, express.static(path.join(__dirname, '../', 'src', 'public')));
    }else{
      app.use('/' + webURL, express.static(path.join(__dirname, 'public')));
    }

    //Set all routes from routes folder
    app.use("/api", routes);
    app.use("/api/mobile", mobile, routes);

    app.listen(PORT, () => {
      console.log("Server started on port " + PORT);
    });
  })
  .catch(error => console.log(error));
