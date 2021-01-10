import { Component, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ImagesHttpService } from '../../services/imagesHttpService';
import { ProfilesDataService } from '../profiles.data.service';
import { Subscription } from 'rxjs';
import { ProfileInfoDto } from '../../models/profileInfoDto';
import { ImageShortInfoDto } from 'src/app/models/imageShortInfoDto';
import { ImageCacheService } from '../../services/imageCacheService';
import { ImageThumbnailViewModel } from '../models/imageThumbnailViewModel';

@Component({
    templateUrl: './overview.component.html'
})
export class OverviewComponent {
    profile: ProfileInfoDto;
    imageThumbnailViewModel = new Array<ImageThumbnailViewModel>();
    subscription: Subscription;

    constructor(
        private imagesService: ImagesHttpService,
        private dataService: ProfilesDataService,
        private imageCacheService: ImageCacheService
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
            this.loadImageThumbnails(data.images.data);
    }

    loadImageThumbnails(data: Array<ImageShortInfoDto>) {
        this.imageThumbnailViewModel.length = data.length;
        for (let i = 0; i < data.length; i++) {
            this.imageThumbnailViewModel[i] = new ImageThumbnailViewModel();
            this.imageThumbnailViewModel[i].info = data[i];
            let sub = this.imageCacheService.requestThumbnailUsingCache(data[i].imageCode, code => this.imagesService.getThumbnailBlob(code))
                .subscribe(
                    link => this.imageThumbnailViewModel[i].resourceUrl = link
                );
        }
    }
}
