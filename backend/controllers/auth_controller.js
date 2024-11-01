import { User } from "../models/User.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookies.js";
import { sendVerificationEmail,sendWelcomeEmail,sendPasswordResetEmail,sendResetSuccessEmail } from "../mailtrap/emails.js";

export const signup=async (req,res)=>{
    const{email,password,name} =req.body;   
    try{
        if(!email||!password||!name){
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
       
        const userAlreadyExists=await User.findOne({email});
        if(userAlreadyExists){
            return res.status(400).json({success:false,message: "User Already Exists"});
        }
        const hashedPassword=await bcryptjs.hash(password,10);
       
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();



    console.log("Verification email sent successfully")
        const user=new User({
            email,
            password:hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        })
        sendVerificationEmail(user.email,verificationToken);
        console.log("verification emaill sent");
       await user.save();
       
       generateTokenAndSetCookie(res,user._id);

      return  res.status(201).json({
         sucess:true,
         massage:"User Created Successfully",
         user :{
            ...user._doc,
            password:undefined,
         }
    });
    }
    catch(error){

        res.status(404).json({success:false,message:"error.message"});
    }
    

}
export const verifyEmail = async (req, res) => {
	const { code } = req.body;
    console.log("inside verification email code")
	try {
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		await sendWelcomeEmail(user.email, user.name);

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
export const login=async (req,res)=>{
    const { email, password } = req.body;
    try{
        const user= await User.findOne({email});
        if(!user){
            return res.status(400).json({sucess:false,message:"User not found "})
        }
        const isPasswordValid=await bcryptjs.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(400).json({success:false,message:"invalid password"});
        }
        generateTokenAndSetCookie(res,user._id);
        user.lastLogin=Date.now();
        await user.save();
        res.status(200).json({
            sucess:true,
            message:"login successfully",
            user :{
                ...user._doc,
                password:undefined,
            }
        })

    }
    catch(error){
        console.log("errorn in coding ",error);
        res.status(400).json({sucess:false,message:error.messsage});

    }
}
export const logout=async (req,res)=>{
   res.clearCookie("token");
   res.status(200).json({success:false,message:"user logged out successfully"})
}
export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordTokenExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};
export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// update password
		const hashedPassword = await bcryptjs.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordTokenExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};
export const checkauth= async (req,res)=>{
    try{
      const user= await User.findById(req.userId).select("-password");
      if(!user){
        return res.status(400).json({
            success:false,message:"user not found"
        });
      }
      res.status(200).json({success:true,user});
    }
    catch{
        console.log("Authorization error",error);
        return res.status(404).json({success:false,message:message.error});

    }
}