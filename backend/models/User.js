import mongoose from 'mongoose';
const userSchema = new mongoose .Schema({
    email:{
        type: 'string',
        required: true,
        unique: true
    },
    password:{
        type:'string',
        required:true,

    },
    name:{
        type:'string',
       required:true
    },
    lastLogin:{
        type:'Date',
        default: Date.now(),


    },
    isVerified:{
        type:'boolean',
        default:'false',
    },
    resetPasswordToken: String,
    resetPasswordTokenExpiresAt:Date,
    verificationToken: String,
    verificationTokenExpiresAt:Date,

},{timestamps:true});
 export const User =mongoose.model('User',userSchema);