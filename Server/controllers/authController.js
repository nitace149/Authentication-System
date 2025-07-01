import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import userModel from '../Models/UserModel.js';


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

    return res.json({success:true})

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