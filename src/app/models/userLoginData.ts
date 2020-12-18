import { UserInfo } from "./userInfo";

export class UserLoginData {
    access_token: string;
    expires: Date;
    user: UserInfo
}