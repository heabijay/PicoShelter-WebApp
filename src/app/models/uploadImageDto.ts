export class UploadImageDto {
    file: File;
    title: string;
    joinToAlbums: Array<number>;
    deleteInHours: number;
    isPublic: boolean;
    quality: number;
}