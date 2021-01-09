import { Component, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ProfileInfoDto } from 'src/app/models/profileInfoDto';
import { ImagesHttpService } from 'src/app/services/imagesHttpService';
import { ProfilesDataService } from '../profiles.data.service';

@Component({
    templateUrl: './images.component.html'
})
export class ImagesComponent {
    profile: ProfileInfoDto;
    imageThumbnailUrls = new Array<string>();
    subscription: Subscription;

    constructor(
        private imagesService: ImagesHttpService,
        private sanitizer: DomSanitizer,
        private dataService: ProfilesDataService
    ) {

    }

    ngOnInit(): void {
        this.subscription = this.dataService.getData().subscribe(
            data => {
                this.onProfileDataRefresh(data);
            }
        )
        this.onProfileDataRefresh(this.dataService.getLastReceivedData());
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    onProfileDataRefresh(data: ProfileInfoDto) {
        this.profile = data;
        if (this.profile != null)
            this.loadImageThumbnails(data.images.map(t => t.imageCode));
    }

    loadImageThumbnails(codes: Array<string>) {
        this.imageThumbnailUrls.length = codes.length;
        for (let i = 0; i < codes.length; i++) {
            let sub = this.imagesService.getThumbnailBlob(codes[i]).subscribe(
                blob => {
                    let objUrl = URL.createObjectURL(blob);
                    this.imageThumbnailUrls[i] = this.sanitizer.sanitize(
                        SecurityContext.RESOURCE_URL,
                        this.sanitizer.bypassSecurityTrustResourceUrl(objUrl)
                    );
                }
            ).add(
                () => sub.unsubscribe()
            );
        }
    }
}
