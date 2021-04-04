import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, ViewChild } from "@angular/core"
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap"
import { Subscription } from "rxjs";
import { AlbumInfoDto } from "src/app/models/albumInfoDto";
import { AlbumsHttpService } from "src/app/services/albumsHttp.service";
import { ImagesHttpService } from "src/app/services/imagesHttp.service";
import { ProfilesHttpService } from "src/app/services/profilesHttp.service";
import { AlbumProfileInfoViewModel } from "../../albums/models/albumProfileInfoViewModel"
import { AlbumInviteViewModel } from "../../albums/models/albumInviteViewModel"
import { AlbumUserRole } from "src/app/enum/albumUserRole";
import { AlbumProfileInfoDto } from "src/app/models/albumProfileInfoDto";
import { NgbdConfirmModalComponent } from "../confirm/ngbdConfirmModal.component";
import { ToastrService } from "ngx-toastr";
import { ErrorResponseDto } from "src/app/models/errorResponseDto";
import { ErrorType } from "src/app/enum/ErrorType";
import { NgModel } from "@angular/forms";
import { UserInfo } from "src/app/models/userInfo";
import { CurrentUserService } from "src/app/services/currentUser.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "ngbd-albummembers-modal",
    templateUrl: "./ngbdAlbumMembersModal.component.html",
    providers: [
        ProfilesHttpService,
        ImagesHttpService,
        AlbumsHttpService
    ]
})
export class NgbdAlbumMembersModalComponent {
    window = window;
    albumUserRole = AlbumUserRole;
    @Input()targetAlbumDto?: AlbumInfoDto;

    @ViewChild("sendInvite") sendInviteField: NgModel;

    albumProfileViewModels = new Array<AlbumProfileInfoViewModel>();
    albumInviteViewModels = new Array<AlbumInviteViewModel>();
    subscription: Subscription;

    isLoading: boolean = true;
    isInvitesLoading: boolean = true;
    totalCount: number;
    invitesTotalCount: number;

    isInviteSending = false;
    isLeaving = false;

    result: boolean;


    get isAllUsersLoaded() {
        return this.albumProfileViewModels?.length >= this.totalCount;
    }

    get isAllInvitesLoaded() {
        return this.albumInviteViewModels?.length >= this.invitesTotalCount;
    }

    constructor(
        public activeModal: NgbActiveModal,
        private profilesService: ProfilesHttpService,
        private toastrService: ToastrService,
        private albumsService: AlbumsHttpService,
        private modalService: NgbModal,
        private currentUserService: CurrentUserService,
        private translateService: TranslateService
    ) {

    }

    ngOnInit(): void {
        this.pushViewModels(this.targetAlbumDto?.users?.data);
        this.totalCount = this.targetAlbumDto?.users?.totalCount;
        this.loadNextPage();
        if (this.targetAlbumDto?.accessRole != null && this.targetAlbumDto?.accessRole <= this.albumUserRole.admin)
            this.loadNextInvitesPage();
    }

    pushViewModels(array: Array<AlbumProfileInfoDto>) {
        array?.forEach(el => {
            const elVm = new AlbumProfileInfoViewModel();
            elVm.info = el;
            elVm.roleViewModel = el.albumRole;
            elVm.avatarUrl = this.profilesService.getAvatarLink(el.user?.id);
            this.albumProfileViewModels?.push(elVm);
        });
    }

    pushInviteViewModels(array: Array<UserInfo>) {
        array?.forEach(el => {
            const elVm = new AlbumInviteViewModel();
            elVm.info = el;
            elVm.avatarUrl = this.profilesService.getAvatarLink(el.id);
            this.albumInviteViewModels?.push(elVm);
        });
    }

    loadNextPage(size: number = 36) {
        if (!this.isAllUsersLoaded) {
            this.isLoading = true;
            const startIndex = this.albumProfileViewModels?.length;
            const sub = this.albumsService.getUsers(this.targetAlbumDto?.code, startIndex, size).subscribe(
                data => {
                    if (data.success) {
                        this.pushViewModels(data?.data?.data);
                        this.totalCount = data?.data?.totalCount;
                    }
                }
            ).add(
                () => this.isLoading = false
            );
        } else {
            this.isLoading = false;
        }
    }

    loadNextInvitesPage(size: number = 36) {
        if (!this.isAllInvitesLoaded) {
            this.isInvitesLoading = true;
            const startIndex = this.albumInviteViewModels?.length;
            const sub = this.albumsService.getInvites(this.targetAlbumDto?.code, startIndex, size).subscribe(
                data => {
                    if (data.success) {
                        this.pushInviteViewModels(data?.data?.data);
                        this.invitesTotalCount = data?.data?.totalCount;
                    }
                }
            ).add(
                () => this.isInvitesLoading = false
            );
        } else {
            this.isInvitesLoading = false;
        }
    }

    close() {
        this.activeModal.close(this.result);
    }

    async onRoleChange(item: AlbumProfileInfoViewModel, event) {
        if (item.info?.albumRole != item.roleViewModel) {
            if (item.roleViewModel == this.albumUserRole.admin) {
                event.srcElement.blur();
                event.preventDefault();
                const modalRef = this.modalService.open(NgbdConfirmModalComponent);
                modalRef.componentInstance.text = this.translateService.instant("modals.albumMembers.modals.warningOnSetAdmin"); 
                const result = await modalRef.result;
                if (result != true) {
                    item.roleViewModel = item.info.albumRole;
                    return;
                }
            }

            item.isChangingRole = true;
            this.albumsService.changeRole(this.targetAlbumDto?.code, item.info?.user?.id, item.roleViewModel).subscribe(
                data => {
                    if (item.roleViewModel == this.albumUserRole.admin) {
                        this.targetAlbumDto.accessRole = this.albumUserRole.editor;
                        const admin = this.albumProfileViewModels.find(t => t.info.albumRole == this.albumUserRole.admin);
                        if (admin != null) {
                            admin.roleViewModel = this.albumUserRole.editor;
                            admin.info.albumRole = this.albumUserRole.editor;
                        }
                    }   

                    item.info.albumRole = item.roleViewModel;
                },
                error => {
                    this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
                    item.roleViewModel = item.info.albumRole;
                }
            ).add(
                () => item.isChangingRole = false
            )
        }
    }

    kickUser(item: AlbumProfileInfoViewModel) {
        const modalRef = this.modalService.open(NgbdConfirmModalComponent);

        let nameStr = "";
        const user = item.info.user;
        if (user.profile?.firstname == null && user.profile?.lastname == null)
            nameStr += user.username;

        else {
            if (user.profile?.firstname != null)
                nameStr += user.profile?.firstname + " ";

            if (user.profile?.lastname != null)
                nameStr += user.profile?.lastname + " ";
            
            nameStr += "(@" + user.username + ")";
        }

        modalRef.componentInstance.text = this.translateService.instant("modals.albumMembers.modals.areYouSureToKick", { 'name': nameStr });
        modalRef.result.then(
            result => {
                const r = result as boolean;

                if (r == true) {
                    item.isDeleting = true;
                    this.albumsService.deleteMembers(
                        this.targetAlbumDto.code,
                        [item.info.user.id]
                    ).subscribe(
                        data => {
                            this.albumProfileViewModels.splice(
                                this.albumProfileViewModels.findIndex(t => t == item), 
                                1
                            );
                            this.totalCount--;
                            this.result = true;
                        },
                        error => {
                            this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
                        }
                    ).add(
                        () => item.isDeleting = false
                    );
                }
            },
            rejected => {
                
            }
        )
    }

    sendInviteByUsername(username: string) {
        this.isInviteSending = true;
        this.albumsService.sendInvite(this.targetAlbumDto.code, username).subscribe(
            data => {
                this.sendInviteField.control.setValue("");
                this.toastrService.success(this.translateService.instant("modals.albumMembers.toastr.inviteSent"));
                this.invitesTotalCount++;
                if (this.albumInviteViewModels?.length >= this.invitesTotalCount - 1)
                    this.loadNextInvitesPage();
            },
            (er : HttpErrorResponse) => {
                let error = er.error as ErrorResponseDto;
                if (error) {
                    switch (ErrorType[error.error.type]) {
                        case ErrorType.USER_NOT_FOUND:
                            this.sendInviteField.control.setErrors({
                                'notFound': true
                            });
                            return;
                        case ErrorType.USER_ALREADY_INVITED:
                            this.sendInviteField.control.setErrors({
                                'alreadyInvited': true
                            });
                            return;
                        case ErrorType.USER_ALREADY_JOINED:
                            this.sendInviteField.control.setErrors({
                                'alreadyJoined': true
                            });
                            return;
                    }
                }

                this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
            }
        ).add(
            () => this.isInviteSending = false
        );
    }

    cancelInvite(item: AlbumInviteViewModel) {
        const modalRef = this.modalService.open(NgbdConfirmModalComponent);

        let nameStr = "";
        const user = item.info;
        if (user.profile?.firstname == null && user.profile?.lastname == null)
            nameStr += user.username;

        else {
            if (user.profile?.firstname != null)
                nameStr += user.profile?.firstname + " ";

            if (user.profile?.lastname != null)
                nameStr += user.profile?.lastname + " ";
            
            nameStr += "(@" + user.username + ")";
        }

        modalRef.componentInstance.text = this.translateService.instant("modals.albumMembers.modals.areYouSureToCancelInvite", { 'name': nameStr });
        modalRef.result.then(
            result => {
                const r = result as boolean;

                if (r == true) {
                    item.isDeleting = true;
                    this.albumsService.deleteInvite(
                        this.targetAlbumDto.code,
                        item.info.id
                    ).subscribe(
                        data => {
                            this.albumInviteViewModels.splice(
                                this.albumInviteViewModels.findIndex(t => t == item), 
                                1
                            );
                            this.invitesTotalCount--;
                        },
                        error => {
                            this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
                        }
                    ).add(
                        () => item.isDeleting = false
                    );
                }
            },
            rejected => {
                
            }
        )
    }

    leaveFromAlbum() {
        const modalRef = this.modalService.open(NgbdConfirmModalComponent);
        modalRef.componentInstance.text = this.translateService.instant("modals.albumMembers.modals.areYouSureToLeave");
        modalRef.result.then(
            result => {
                const r = result as boolean;

                if (r == true) {
                    this.isLeaving = true;
                    this.albumsService.deleteMembers(
                        this.targetAlbumDto.code,
                        [this.currentUserService?.currentUser?.id]
                    ).subscribe(
                        data => {
                            this.result = true;
                            this.close();
                        },
                        error => {
                            this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
                        }
                    ).add(
                        () => this.isLeaving = false
                    );
                }
            },
            rejected => {
                
            }
        )
    }
}