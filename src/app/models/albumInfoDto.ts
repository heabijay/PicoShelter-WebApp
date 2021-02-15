import { AlbumProfileInfoDto } from "./albumProfileInfoDto";
import { ImageShortInfoDto } from "./imageShortInfoDto";
import { PaginationResultDto } from "./paginationResultDto";
import { AlbumUserRole } from "../enum/albumUserRole";

export class AlbumInfoDto {
    id: number;
    code: string;
    title: string;
    usercode: string;
    isPublic: boolean;
    previewImage: ImageShortInfoDto;
    createdDate: Date;
    accessRole: AlbumUserRole;
    images: PaginationResultDto<ImageShortInfoDto>;
    users: PaginationResultDto<AlbumProfileInfoDto>;
}