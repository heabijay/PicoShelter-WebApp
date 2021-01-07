import { Component, Sanitizer, SecurityContext } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { ProfileInfoDto } from '../models/profileInfoDto';
import { SuccessResponseDto } from '../models/successResponseDto';
import { CurrentUserService } from '../services/currentUserService';
import { ProfilesHttpService } from "../services/profilesHttpService"
import { ImagesHttpService } from "../services/imagesHttpService"
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    templateUrl: './profiles.component.html',
    providers: [
        ProfilesHttpService,
        CurrentUserService,
        ImagesHttpService
    ]
})
export class ProfilesComponent {
    profile = new ProfileInfoDto();
    avatarUrl: string;
    paramSubscription: Subscription;
    imageThumbnailUrls = new Array<string>();

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private profilesService: ProfilesHttpService,
        private currentUserService: CurrentUserService,
        private imagesService: ImagesHttpService,
        private toastrService: ToastrService,
        private sanitizer: DomSanitizer
    ) { 
        this.paramSubscription = this.activatedRoute.params.subscribe(param => 
        {
            var id: number = param["id"];
            var username: string = param["username"];

            var requestMethod : Observable<SuccessResponseDto<ProfileInfoDto>>;

            if (id != null) {
                this.avatarUrl = this.profilesService.getAvatarLink(id);

                if (this.currentUserService.currentUser.id == id)
                    this.profile.userinfo = this.currentUserService.currentUser;

                requestMethod = this.profilesService.getProfile(id);
            }
            else {
                this.avatarUrl = this.profilesService.getAvatarLinkByUsername(username);

                if (this.currentUserService.currentUser.username.toLowerCase() == username.toLowerCase())
                    this.profile.userinfo = this.currentUserService.currentUser;

                requestMethod = this.profilesService.getProfileByUsername(username);
            }

            let req = requestMethod.subscribe(
                data => {
                    if (data != null && data.success) {
                        this.profile = data.data;

                        this.loadImageThumbnails(data.data.images.map(t => t.imageCode));
                    }
                },
                error => {
                    this.router.navigateByUrl("/not-found", {
                        skipLocationChange: true
                    });
                }
            ).add(
                () => req.unsubscribe()
            )
        });
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
                () => { sub.unsubscribe()
                console.log(this.imageThumbnailUrls); }
                
            );
        }
    }

    copyBeautifulLink() {
        const selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = window.location.origin + "/p/" + this.profile.userinfo.username;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
        this.toastrService.success("Link copied to clipboard!");
    }
}
