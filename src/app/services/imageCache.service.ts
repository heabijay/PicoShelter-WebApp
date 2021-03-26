import { Injectable, SecurityContext } from "@angular/core";
import { ImageCacheDto } from "../models/imageCacheDto";
import { Observable, Subject, of, Subscription } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";

var imageCacheDb = new Array<ImageCacheDto>();

@Injectable()
export class ImageCacheService {
    constructor(
        private sanitizer: DomSanitizer
    ) {
        
    }

    getImage(code: string) : ImageCacheDto {
        return imageCacheDb.filter(t => t.code.toUpperCase() == code.toUpperCase())[0];
    }

    requestThumbnailUsingCache(code: string, request: (code: string) => Observable<Blob>) : Observable<string> {
        let el = this.getImage(code);

        if (el == null) {
            el = new ImageCacheDto();
            el.code = code;
            imageCacheDb.push(el);
        }

        if (el?.thumbnailResourceUrl) {
            return of(el?.thumbnailResourceUrl);
        }
        else if (el?.thumbnailSub == null) {
            const subject = new Subject<string>();
            request(code).subscribe(
                blob => {
                    const link = this.resourceUrlOfBlob(blob);
                    el.thumbnailResourceUrl = link;
                    subject.next(link);
                },
                error => subject.error(error),
                () => {
                    subject.complete();
                    el.thumbnailSub = null;
                }
            );
            el.thumbnailSub = subject.asObservable();
        }

        return el?.thumbnailSub;
    }

    requestImageUsingCache(code: string, request: (code) => Observable<Blob>) : Observable<string> {
        let el = this.getImage(code);

        if (el == null) {
            el = new ImageCacheDto();
            el.code = code;
            imageCacheDb.push(el);
        }

        if (el?.imageResourceUrl) {
            return of(el?.imageResourceUrl);
        }
        else if (el?.imageSub == null) {
            const subject = new Subject<string>();
            request(code).subscribe(
                blob => {
                    const link = this.resourceUrlOfBlob(blob);
                    el.imageResourceUrl = link;
                    subject.next(link);
                },
                error => subject.error(error),
                () => {
                    subject.complete();
                    el.imageSub = null;
                }
            );
            el.imageSub = subject.asObservable();
        }

        return el?.imageSub;
    }

    resourceUrlOfBlob(blob: Blob) {
        const objUrl = URL.createObjectURL(blob);
        return this.sanitizer.sanitize(
            SecurityContext.RESOURCE_URL,
            this.sanitizer.bypassSecurityTrustResourceUrl(objUrl)
        );
    }
}