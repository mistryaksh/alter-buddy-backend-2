export interface IUserProps {
     name: { firstName: string; lastName: string };
     email: string;
     mobile: string;
     password: string;
     acType: UserAccountType;
     verified: boolean;
     block: boolean;
     online: boolean;
}

export type UserAccountType = "USER" | "ADMIN";
