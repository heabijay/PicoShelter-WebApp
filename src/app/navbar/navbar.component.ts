import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription, timer } from "rxjs";
import { UserInfo } from "../models/userInfo";
import { IdentityHttpService } from "../services/identityHttpService";
import { ProfilesHttpService } from "../services/profilesHttpService";
import { CurrentUserService } from "../services/currentUserService";
import { TokenService } from "../services/tokenService";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { NgbdProfileSettingsModalComponent } from "../modals/settings/ngbdProfileSettingsModal.component";
import { PaginationResultDto } from "../models/paginationResultDto";
import { AlbumShortInfoDto } from "../models/albumShortInfoDto";
import { AlbumInviteViewModel } from "./models/albumInviteViewModel"
import { NgbdConfirmModalComponent } from "../modals/confirm/ngbdConfirmModal.component";
import { AlbumsHttpService } from "../services/albumsHttpService";
import { UserAlbumInviteDto } from "../models/userAlbumInviteDto";
import { ConfirmationHttpService } from "../services/confirmationHttpService";

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
        private confirmationService: ConfirmationHttpService
    ) {
        
    }

    ngOnInit(): void {
        this.subscription = this.currentUserService.onCurrentUserChanged.subscribe(this.onCurrentUserUpdated);
        this.onCurrentUserUpdated(this.currentUserService.currentUser);
    }

    onCurrentUserUpdated(userInfo: UserInfo) {
        const isUserChanged = this.currentUser?.id != userInfo?.id;
        
        this.currentUser = this.currentUserService.currentUser;

        if (isUserChanged) {
            if (this.currentUser == null) {
                this.updatesTimer?.unsubscribe();

            }
            else {
                this.updatesTimer = timer(0, 60000).subscribe(
                    async () => {
                        const data = await this.identityService.getAlbumInvites(null, 5).toPromise();
                        if (data.success)
                            this.lastAlbumInvitesResponse = data.data;
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

                this.toastrService.success("You successfully joined to album!");
            },
            error => {
                this.toastrService.error("Something went wrong while acception invite :(");
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

                this.toastrService.info("Invite successfully discarded.");
            },
            error => {
                this.toastrService.error("Something went wrong while discarding invite :(");
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