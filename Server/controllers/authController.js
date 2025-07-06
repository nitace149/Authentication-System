import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import userModel from '../Models/UserModel.js';
import transporter from '../Config/nodeMailer.js'

export const register =  async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: 'Missing Detail' });

  }
  try {

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'User Already Exists' });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const user = new userModel({ name, email, password: hashPassword });
    await user.save();

    const token = jwt.sign({id : user._id} , process.env.JWT_SECRET, {expiresIn : '7d'});

    res.cookie('token', token, {
      httpOnly: true,
      secure : process.env.NODE_ENV === 'production',
      sameSite : process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge : 7*24*3600*1000
    })

    // Sending WelCome Message
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: `Hey ${name}, great to have you on board! `,
      text: `Welcome ${name}!, your account has been created successfully with email Id: ${email}`
    }

    await transporter.sendMail(mailOption);
    
    return res.json({ success: true, message: "Registration successful" })

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: 'Email and password are required' });
  }

  try{
    const user = await userModel.findOne({email})

    if (!user){
      return res.json({success: false, message: "Invalid Email"})
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch){
      return res.json({success: false, message: "Invalid password"})
    }


    const token = jwt.sign({id : user._id} , process.env.JWT_SECRET, {expiresIn : '7d'});

    res.cookie('token', token, {
      httpOnly: true,
      secure : process.env.NODE_ENV === 'production',
      sameSite : process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge : 7*24*3600*1000
    })

    return res.json({success:true})

  }catch(error){
    return res.json({success : false ,message: error.message})
  }
  
  
}

export const logout = async (req, res) => {
  try {
   res.clearCookie('token', {
      httpOnly: true,
      secure : process.env.NODE_ENV === 'production',
      sameSite : process.env.NODE_ENV === 'production' ? 'none' : 'strict',
   });

    return res.json({success:true, message: "Successfully Logged Out"})

  } catch (error) {

   return res.json({success : false ,message: error.message})

  }
}

export const sendVerifyOtp = async (req, res) => {
  try {
    const {userId} = req.body;

   const user = await userModel.findOne({ _id: userId });
    if (user.isAccountVerified){
      return res.json({success: false, message:"Account already verifyed"})
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOTP = otp;
    user.verifyOTPexpireAt = Date.now()+24*60*60*1000;

    await user.save();

   

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: `Account Verification OTP `,
      text: `Yout OTP is ${otp}, Verify your account using this. `
    }

    await transporter.sendMail(mailOption);
    res.json({success:true, message:"Verification OTP is sent on Email "})

  } catch (error) {
      res.json({success: false, message:error.message});
  }

}

export const verifyEmail = async (req, res) => {

const { otp, userId } = req.body;

const stringOtp = String(otp); 

  if (!userId || !otp){
    return res.json({success:false, message:"Missing Details"})
  }

  try {
    
  const user = await userModel.findOne({ _id: userId });
  
  
 
    if (!user){
      return res.json({success:false, message:"user Not found"})
    }


   if (user.verifyOTP === '' || user.verifyOTP !== stringOtp){
  return res.json({ success: false , message:"Invalid OTP" });
}

    if (user.verifyOTPexpireAt < Date.now()){
      return res.json({success: false , message:"OTP Expired"});
    }

    user.isAccountVerified = true;
    user.verifyOTPexpireAt = 0;
    user.verifyOTP = ''
    await user.save();
    return res.json({success: true, message: 'Email verified successfully'})
    
  } catch (error) {
    return res.json({success:false, message:error.message})
  }

}







