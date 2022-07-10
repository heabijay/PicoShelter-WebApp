import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { NgbdAlbumCreateModalComponent } from 'src/app/modals/albumCreate/ngbdAlbumCreateModal.component';
import { AlbumInfoDto } from 'src/app/models/albumInfoDto';
import { AlbumShortInfoDto } from 'src/app/models/albumShortInfoDto';
import { ProfileInfoDto } from 'src/app/models/profileInfoDto';
import { CurrentUserService } from 'src/app/services/currentUser.service';
import { ImageCacheService } from 'src/app/services/imageCache.service';
import { ProfilesHttpService } from 'src/app/services/profilesHttp.service';
import { ProfilesDataService } from '../profiles.data.service';
import { AlbumViewModel } from '../models/albumViewModel';
import { ImageShortInfoDto } from 'src/app/models/imageShortInfoDto';
import { AlbumHttpService } from 'src/app/services/albumHttp.service';
import { AlbumsHttpService } from 'src/app/services/albumsHttp.service';
import { customReuseStrategyClear } from 'src/app/custom-reuse.strategy';

@Component({
    templateUrl: './albums.component.html'
})
export class AlbumsComponent {
    profile: ProfileInfoDto;
    subscription: Subscription;

    albums = new Array<AlbumViewModel>();

    get isMyAccount() {
        return this.currentUserService.currentUser?.id == this.profile?.userinfo?.id;
    }

    get isAllAlbumsLoaded() {
        return this.albums.length >= this.profile?.albums?.totalCount;
    }

    isLoading: boolean = true;

    constructor(
        private currentUserService: CurrentUserService,
        private router: Router,
        private dataService: ProfilesDataService,
        private profilesService: ProfilesHttpService,
        private imageCacheService: ImageCacheService,
        private modalService: NgbModal,
        private albumsService: AlbumsHttpService
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
        if (this.profile != null) {
            this.isLoading = false;

            if (this.profile.albums)
                this.loadAlbums(this.profile.albums.data);
        }
    }

    createAlbum() {
        const modalRef = this.modalService.open(NgbdAlbumCreateModalComponent, { centered: true });
        modalRef.result.then(
            result => {
                const r = result as AlbumInfoDto;
                if (r != null) {
                    setTimeout(customReuseStrategyClear);
                    this.router.navigateByUrl("/a/" + r.code);
                }
            },
            rejected => {
                
            }
        )
    }

    loadAlbums(dtos: Array<AlbumShortInfoDto>) {
        for (let i = 0; i < dtos.length; i++) {
            if (this.albums.find(t => t.dto.id == dtos[i].id))
                continue;

            const el = new AlbumViewModel();
            el.dto = dtos[i];

            if (el.dto?.previewImage != null) {
                const sub = this.imageCacheService.requestThumbnailUsingCache(el.dto.previewImage.imageCode, code => this.albumsService.getThumbnailBlob(el.dto.code, el.dto.previewImage.imageCode))
                    .subscribe(
                        link => el.thumbnailResourceUrl = link
                    );
            }

            this.albums.push(el);
        }
    }

    loadNextPage(size: number = 72) {
        if (!this.isAllAlbumsLoaded) {
            this.isLoading = true;
            const startIndex = this.albums.length;
            const sub = this.profilesService.getAlbums(this.profile.userinfo.id, startIndex, size).subscribe(
                data => {
                    if (data.success) {
                        this.profile.images.totalCount = data.data.totalCount;
                        this.loadAlbums(data.data.data);
                    }
                }
            ).add(
                () => this.isLoading = false
            );
        } else {
            this.isLoading = false;
        }
    }
}
