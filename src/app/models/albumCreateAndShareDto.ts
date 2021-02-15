import { AlbumCreateDto } from "./albumCreateDto";

export class AlbumCreateAndShareDto extends AlbumCreateDto {
    joinedPhotos: Array<number>;
}