const User = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");


const sendResetPasswordMail = async(name,email,token) =>{
    try{

        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword
            }        
        });

        const mailOPtions = {
          from: config.emailUser,
          to: email,
          subject: " for reset password",
          html:
            "<p> Hii " +
            name +
            ', Please copy the link <a href="http://localhost:3000/api/reset-password?token='+token+'" > and reset ur password</a>'
        };
        transporter.sendMail(mailOPtions,function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("mail has been sent:- ",info.response);

            }

        })


    } catch{
        res.status(400).send({success:false,msg:error.message});
    }
}



const create_token = async(id) =>{
    try{

        const token = await jwt.sign({_id:id},config.secret_jwt);
        return token;

    }catch (error){
        res.status(400).send(error.message);
    }
}


const securePassword = async(password) => {

    try{
        const passwordHash = await bcryptjs.hash(password,10);
        return passwordHash;

    }catch(error){
        res.status(400).send(error.message);
    }
}
 const register_user = async(req,res) =>{
    try{

        const spassword = await securePassword(req.body.password);
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            password:spassword,
            mobile:req.body.mobile,
            image:req.file.filename,
            type:req.body.type
            
        });

        const userData = await User.findOne({email:req.body.email});
        if(userData){
            res.status(200).send({ success: false, msg: "this email is already exists" });

        }
        else{
            const user_data = await user.save();
            res.status(200).send({success:true,data:user_data})
        }

    }catch(error){
        res.status(400).send(error.message);

    }
 }


//   login Method

const user_login = async(req,res) =>{
    try{

        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});
        if(userData){
            const passwordMatch = await bcryptjs.compare(password,userData.password);    
            if(passwordMatch){
                const tokenData = await create_token(userData._id);
                const userResult = {
                    _id:userData._id,
                    name:userData.name,
                    email:userData.email,
                    password:userData.password,
                    image:userData.image,
                    mobile:userData.mobile,
                    type:userData.type,
                    token:tokenData
                }
                const response = {
                    success:true,
                    msg:" User Details",
                    data:userResult
                }
                res.status(200).send(response);
            }
            else{
                res.status(200).send({success:false,msg:" Login Details are incorrect"})
            }
        }
            else{
             res.status(200).send({success:false,msg:" Login Details are incorrects"})
            }

    } catch (error){
        res.status(400).send(error.message);
    }
}


//Update password method

const update_password = async (req,res) => {
    try{

        const user_id =req.body.user_id;
        const password =req.body.password;

        const data = await User.findOne({ _id:user_id});
        if (data){
            const newPassword = await securePassword(password);
            const userData = await User.findByIdAndUpdate ({ _id:user_id} ,{$set:{
                password:newPassword
            }});

            res.status(200).send({success:true,msg : "Your password has been updated"});
        }
        else{
            res.status(200).send({success:false,msg : " User Id not Found!"})
        }


    } catch (error){
        res.status(400).send(error.message);
    }
};


const forget_password = async (req,res) =>{
    try{

        const email= req.body.email;
        const userData = await User.findOne({email:req.body.email});

        if(userData){


            const randomString = randomstring.generate();
            const data = await User.updateOne({email:email},{$set:{token:randomString}})
            sendResetPasswordMail(userData.name,userData.email,randomString)
            res.status(200).send({success: true,msg: "Please check your inbox mail and reset password"});

        }
        else{
            res.status(200).send({success:true,msg:"This email does not exist"})
        }

    } catch (error){
        res.status(400).send({success:false,msg:error.message});

    }
}


const reset_password = async(req,res) => {
    try{
        const token = req.query.token;
        const tokenData = await User.findOne({ token:token});
        if(tokenData){
            const password = req.body.password;
            const newPassword = await securePassword(password);
            const userData = User.findByIdAndUpdate({ _id:tokenData._id},{$set:{password:newPassword ,token:''}},{new:true});
            res.status(200).send({ success: true, msg:"User Password has been reset", data:userData });


        }
        else{
            res.status(200).send({ success: false, msg: "This link has been expired" });

        }


    } catch (error){
        res.status(400).send({ success: false, msg: error.message });
    }
}



 module.exports = {
    register_user,
    user_login,
    update_password,
    forget_password,
    reset_password

 }