import { UserInfo } from "./userInfo";

export class ImageCommentDto {
    id: number;
    text: string;
    date: Date;
    profile: UserInfo;
}