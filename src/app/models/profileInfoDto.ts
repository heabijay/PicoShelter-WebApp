import { UserInfo } from "./userInfo";
import { ImageShortInfoDto } from "./imageShortInfoDto"
import { AlbumShortInfoDto } from "./albumShortInfoDto"

export class ProfileInfoDto {
    userinfo: UserInfo;
    images: ImageShortInfoDto[];
    albums: AlbumShortInfoDto[];
}