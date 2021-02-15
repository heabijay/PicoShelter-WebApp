import { UserInfo } from "../models/userInfo"

export class ImageInfoDto {
    imageId: number;
    imageCode: string;
    imageType: string;
    title: string;
    isPublic: boolean;
    user: UserInfo;
    uploadedTime: Date;
    autoDeleteIn?: Date;
}