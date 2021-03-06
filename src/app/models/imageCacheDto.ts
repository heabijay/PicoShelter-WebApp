import { Observable } from "rxjs";

export class ImageCacheDto {
    code: string;
    thumbnailResourceUrl: string;
    imageResourceUrl: string;
    thumbnailSub: Observable<string>;
    imageSub: Observable<string>;
}