import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription, timer } from "rxjs";
import { UserInfo } from "../models/userInfo";
import { IdentityHttpService } from "../services/identityHttp.service";
import { ProfilesHttpService } from "../services/profilesHttp.service";
import { CurrentUserService } from "../services/currentUser.service";
import { TokenService } from "../services/token.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { NgbdProfileSettingsModalComponent } from "../modals/settings/ngbdProfileSettingsModal.component";
import { PaginationResultDto } from "../models/paginationResultDto";
import { AlbumShortInfoDto } from "../models/albumShortInfoDto";
import { AlbumInviteViewModel } from "./models/albumInviteViewModel"
import { NgbdConfirmModalComponent } from "../modals/confirm/ngbdConfirmModal.component";
import { AlbumsHttpService } from "../services/albumsHttp.service";
import { UserAlbumInviteDto } from "../models/userAlbumInviteDto";
import { ConfirmationHttpService } from "../services/confirmationHttp.service";
import { TranslateService } from "@ngx-translate/core";
import { HttpErrorResponse } from "@angular/common/http";
import { isThisTypeNode } from "typescript";

@Component({
    selector: "navbar",
    templateUrl: "./navbar.component.html",
    providers: [
        ProfilesHttpService,
        IdentityHttpService,
        AlbumsHttpService,
        ConfirmationHttpService
    ]
})
export class NavbarComponent {
    currentUser: UserInfo;
    subscription: Subscription;
    updatesTimer: Subscription;

    get currentUserAvatarLink() {
        if (this.currentUser?.id != null)
            return this.profilesHttpService.getAvatarLink(this.currentUser?.id);
        return null;
    }

    lastAlbumInvitesResponse: PaginationResultDto<UserAlbumInviteDto>;

    get notificationsCount() {
        return 0 + this.lastAlbumInvitesResponse?.totalCount;
    }
    
    albumInvitesViewModels: Array<AlbumInviteViewModel> = new Array<AlbumInviteViewModel>();
    albumInvitesTotal: number;
    isInvitesLoading = false;
    get isAllInvitesLoaded() {
        return this.albumInvitesViewModels?.length >= this.albumInvitesTotal;
    }

    constructor(
        private tokenService: TokenService,
        private currentUserService: CurrentUserService, 
        private router: Router,
        public profilesHttpService: ProfilesHttpService,
        private modalService: NgbModal,
        private identityService: IdentityHttpService,
        private albumsService: AlbumsHttpService,
        private toastrService: ToastrService,
        private confirmationService: ConfirmationHttpService,
        private translateService: TranslateService
    ) {
        
    }

    ngOnInit(): void {
        this.subscription = this.currentUserService.onCurrentUserChanged.subscribe(
            data => this.onCurrentUserUpdated(data),
            error => { }
        );
        this.onCurrentUserUpdated(this.currentUserService.currentUser);
    }

    onCurrentUserUpdated(userInfo: UserInfo) {
        const isUserChanged = this.currentUser?.id != userInfo?.id;
        
        this.currentUser = userInfo;

        if (isUserChanged) {
            if (this.currentUser == null) {
                this.updatesTimer?.unsubscribe();

            }
            else {
                this.updatesTimer = timer(0, 60000).subscribe(
                    () => {
                        this.identityService.getAlbumInvites(null, 5).subscribe(
                            data => {
                                if (data.success)
                                    this.lastAlbumInvitesResponse = data.data;
                            },
                            (error: HttpErrorResponse) => {
                                if (error?.status == 401) {
                                    this.tokenService.setTokenWithProfile(null);
                                }
                            }
                        );
                    }
                );
            }
        }
    }

    prepairViewModels() {
        this.albumInvitesViewModels = new Array<AlbumInviteViewModel>();
        this.albumInvitesTotal = this.lastAlbumInvitesResponse.totalCount;
        this.pushInviteViewModels(this.lastAlbumInvitesResponse.data);
    }

    pushInviteViewModels(array: Array<UserAlbumInviteDto>) {
        array?.forEach(el => {
            if (this.albumInvitesViewModels.find(t => t.info.key == el.key))
                return;

            const vm = new AlbumInviteViewModel();
            vm.info = el;
            this.albumInvitesViewModels?.push(vm);
        });
    }

    loadNextInvitesPage(size: number = 36) {
        if (!this.isAllInvitesLoaded) {
            this.isInvitesLoading = true;
            const startIndex = this.albumInvitesViewModels?.length;
            const sub = this.identityService.getAlbumInvites(startIndex, size).subscribe(
                data => {
                    if (data.success) {
                        this.pushInviteViewModels(data?.data?.data);
                        this.lastAlbumInvitesResponse.totalCount = data?.data?.totalCount;
                    }
                }
            ).add(
                () => this.isInvitesLoading = false
            );
        } else {
            this.isInvitesLoading = false;
        }
    }

    acceptInvite(item: AlbumInviteViewModel) {
        item.isJoining = true;
        this.confirmationService.confirm(item.info.key).subscribe(
            data => {
                this.albumInvitesViewModels.splice(
                    this.albumInvitesViewModels.findIndex(t => t == item), 
                    1
                );
                this.albumInvitesTotal--;

                const inCacheIndex = this.lastAlbumInvitesResponse.data.findIndex(t => t == item.info);
                if (inCacheIndex != -1) {
                    this.lastAlbumInvitesResponse.data.splice(inCacheIndex, 1);
                    this.lastAlbumInvitesResponse.totalCount--;
                }

                this.toastrService.success(this.translateService.instant("navbar.profile.notifications.albumInvites.toastr.accepted"));
            },
            error => {
                this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
            }
        ).add(
            () => item.isJoining = false
        );
    }

    discardInvite(item: AlbumInviteViewModel) {
        item.isCancelling = true;
        this.albumsService.deleteInvite(
            item.info.album.code,
            this.currentUser.id
        ).subscribe(
            data => {
                this.albumInvitesViewModels.splice(
                    this.albumInvitesViewModels.findIndex(t => t == item), 
                    1
                );
                this.albumInvitesTotal--;

                const inCacheIndex = this.lastAlbumInvitesResponse.data.findIndex(t => t == item.info);
                if (inCacheIndex != -1) {
                    this.lastAlbumInvitesResponse.data.splice(inCacheIndex, 1);
                    this.lastAlbumInvitesResponse.totalCount--;
                }

                this.toastrService.info(this.translateService.instant("navbar.profile.notifications.albumInvites.toastr.discarded"));
            },
            error => {
                this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
            }
        ).add(
            () => item.isCancelling = false
        );
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    logout() {
        this.tokenService.setTokenWithProfile(null);
        this.router.navigateByUrl("/");
    }

    gotoMyProfile() {
        this.router.navigateByUrl(this.profilesHttpService.getProfileLink(this.currentUser.id));
    }

    openSettingsModal() {
        const modalRef = this.modalService.open(NgbdProfileSettingsModalComponent, { centered: true, size: "xl" });
    }
}