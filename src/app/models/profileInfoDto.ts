import { UserInfo } from "./userInfo";
import { ImageShortInfoDto } from "./imageShortInfoDto"
import { AlbumShortInfoDto } from "./albumShortInfoDto"
import { PaginationResultDto } from "./paginationResultDto"

export class ProfileInfoDto {
    userinfo: UserInfo;
    images: PaginationResultDto<ImageShortInfoDto>;
    albums: PaginationResultDto<AlbumShortInfoDto>;
}