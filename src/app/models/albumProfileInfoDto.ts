import { UserInfo } from "./userInfo"
import { AlbumUserRole } from "../enum/albumUserRole"

export class AlbumProfileInfoDto {
    user: UserInfo;
    albumRole: AlbumUserRole;
}