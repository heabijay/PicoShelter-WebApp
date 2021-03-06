import { ImageShortInfoDto } from "./imageShortInfoDto";

export class AlbumShortInfoDto {
    id: number;
    code: string;
    title: string;
    isPublic: boolean;
    previewImage: ImageShortInfoDto;
}