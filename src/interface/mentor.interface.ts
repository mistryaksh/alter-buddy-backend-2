import mongoose from "mongoose";

interface IMentorNameProps {
     firstName: string;
     lastName: string;
}

interface IMentorContactProps {
     email: string;
     mobile: string;
     address: string;
}

export interface IMentorAuthProps {
     username: string;
     password: string;
}

interface IMentorAccountStatus {
     verification: boolean;
     block: boolean;
     online: boolean;
}

export interface IMentorProps {
     name: IMentorNameProps;
     contact: IMentorContactProps;
     auth: IMentorAuthProps;
     category: mongoose.Schema.Types.ObjectId;
     specialists: string[];
     accountStatus: IMentorAccountStatus;
     acType: "MENTOR";
     subCategory: mongoose.Schema.Types.ObjectId[];
}

export interface ICategoryProps {
     title: string;

     status: boolean;
}

export interface ISubCategoryProps {
     label: string;
     categoryId: mongoose.Schema.Types.ObjectId;
     subTitle: string;
     desc: string;
     symptoms: string[];
     causes: string[];
     treatment: string[];
}
