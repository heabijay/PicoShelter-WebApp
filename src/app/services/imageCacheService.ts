import { Injectable, SecurityContext } from "@angular/core";
import { ImageCacheDto } from "../models/imageCacheDto";
import { Observable, Subject, of } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";

@Injectable()
export class ImageCacheService {
    constructor(
        private sanitizer: DomSanitizer
    ) {
        
    }

    imageCacheDb = new Array<ImageCacheDto>();

    getImage(code: string) : ImageCacheDto {
        return this.imageCacheDb.filter(t => t.code.toUpperCase() == code.toUpperCase())[0];
    }

    setImageThumbnail(code: string, thumbnailResUrl: string) {
        const item = this.imageCacheDb.filter(t => t.code.toUpperCase() == code.toUpperCase())[0];
        if (item) {
            item.thumbnailResourceUrl = thumbnailResUrl;
        }
        else {
            const newItem = new ImageCacheDto();
            newItem.code = code;
            newItem.thumbnailResourceUrl = thumbnailResUrl;
            this.imageCacheDb.push(newItem);
        }
    }

    setImage(code: string, imageResUrl: string) {
        const item = this.imageCacheDb.filter(t => t.code.toUpperCase() == code.toUpperCase())[0];
        if (item) {
            item.imageResourceUrl = imageResUrl;
        }
        else {
            const newItem = new ImageCacheDto();
            newItem.code = code;
            newItem.imageResourceUrl = imageResUrl;
            this.imageCacheDb.push(newItem);
        }
    }

    requestThumbnailUsingCache(code: string, request: (code: string) => Observable<Blob>) : Observable<string> {
        const url = this.getImage(code)?.thumbnailResourceUrl;
        if (url) {
            return of(url);
        }
        else {
            const subject = new Subject<string>();
            request(code).subscribe(
                blob => {
                    const link = this.resourceUrlOfBlob(blob);
                    this.setImageThumbnail(code, link);
                    subject.next(link);
                },
                error => subject.error(error),
                () => subject.complete()
            );
            return subject.asObservable();
        }
    }

    requestImageUsingCache(code: string, request: (code) => Observable<Blob>) : Observable<string> {
        const url = this.getImage(code)?.imageResourceUrl;
        if (url) {
            return of(url);
        }
        else {
            const subject = new Subject<string>();
            request(code).subscribe(
                blob => {
                    const link = this.resourceUrlOfBlob(blob);
                    this.setImage(code, link);
                    subject.next(link);
                },
                error => subject.error(error),
                () => subject.complete()
            );
            return subject.asObservable();
        }
    }

    resourceUrlOfBlob(blob: Blob) {
        const objUrl = URL.createObjectURL(blob);
        return this.sanitizer.sanitize(
            SecurityContext.RESOURCE_URL,
            this.sanitizer.bypassSecurityTrustResourceUrl(objUrl)
        );
    }
}