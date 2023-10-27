const express = require("express");
const user_route = express();

const bodyParser = require("body-parser");
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

const multer = require("multer");
const path = require("path");

user_route.use(express.static("public"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(
      null,
      path.join(__dirname, "../public/userImages"),
      function (error, sucess) {
        if (error) throw error;
      }
    );
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "" + file.originalname;
    cb(null, name, function (eroor1, success1) {
      if (error1) throw error1;
    });
  },
});

const upload = multer({ storage: storage });

const user_controller = require("../controllers/userController");

const auth = require("../middleware/auth");

//Register route
user_route.post("/register",upload.single("image"),user_controller.register_user);

// Loin route
user_route.post("/login", user_controller.user_login);

// jwt Authentication route
user_route.get("/test",auth,(req,res)=>{
  res.status(200).send({success:true,msg:"Authenticated"})
})

// update password rote
user_route.post('/update-password',auth,user_controller.update_password);

// forget password route
user_route.post('/forget-password',user_controller.forget_password);

// Reset password
user_route.get('/reset-password',user_controller.reset_password);



module.exports = user_route;
