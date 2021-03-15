import { AlbumUserRole } from "src/app/enum/albumUserRole";
import { AlbumProfileInfoDto } from "../../models/albumProfileInfoDto";

export class AlbumProfileInfoViewModel {
    info: AlbumProfileInfoDto;
    avatarUrl: string;
    roleViewModel: AlbumUserRole;
    isDeleting: boolean;
    isChangingRole: boolean;
}