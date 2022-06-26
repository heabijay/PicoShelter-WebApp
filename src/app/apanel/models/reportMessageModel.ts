import { UserInfo } from "../../models/userInfo";

export class ReportMessageModel {
    author: UserInfo;
    comment: string;
    createdOn: Date;
}