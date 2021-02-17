import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { NgbdAlbumCreateModalComponent } from 'src/app/modals/albumCreate/ngbdAlbumCreateModal.component';
import { AlbumInfoDto } from 'src/app/models/albumInfoDto';
import { AlbumShortInfoDto } from 'src/app/models/albumShortInfoDto';
import { ProfileInfoDto } from 'src/app/models/profileInfoDto';
import { CurrentUserService } from 'src/app/services/currentUserService';
import { ImageCacheService } from 'src/app/services/imageCacheService';
import { ProfilesHttpService } from 'src/app/services/profilesHttpService';
import { ProfilesDataService } from '../profiles.data.service';
import { AlbumViewModel } from '../models/albumViewModel';
import { ImageShortInfoDto } from 'src/app/models/imageShortInfoDto';

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

    isLoading: boolean = false;

    constructor(
        private currentUserService: CurrentUserService,
        private router: Router,
        private dataService: ProfilesDataService,
        private profilesService: ProfilesHttpService,
        private imageCacheService: ImageCacheService,
        private modalService: NgbModal,
        private toastrService: ToastrService
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
        if (this.profile != null && this.profile.albums) {
            this.loadAlbums(this.profile.albums.data);
        }
    }

    createAlbum() {
        const modalRef = this.modalService.open(NgbdAlbumCreateModalComponent, { centered: true });
        modalRef.result.then(
            result => {
                const r = result as AlbumInfoDto;
                if (r != null) {
                    this.router.navigateByUrl("/a/" + r.code);
                }
            }
        )
    }

    loadAlbums(dtos: Array<AlbumShortInfoDto>) {
        for (let i = 0; i < dtos.length; i++) {
            const el = new AlbumViewModel();
            el.dto = dtos[i];
            
            // TODO: Implement thumbnail lazy load

            if (el.dto.title == null) {
                el.dto.previewImage = new ImageShortInfoDto();
                el.thumbnailResourceUrl = "https://localhost:5000/profiles/1/avatar.jpg";
            }
            this.albums.push(el);
        }
    }
}
