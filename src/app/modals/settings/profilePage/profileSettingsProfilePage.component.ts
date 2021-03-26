import { Component, ViewChild } from '@angular/core';
import { CurrentUserService } from 'src/app/services/currentUser.service';
import { ProfilesHttpService } from 'src/app/services/profilesHttp.service';
import { ProfileHttpService } from 'src/app/services/profileHttp.service';
import { ProfileEditDto } from 'src/app/models/profileEditDto';
import { ToastrService } from 'ngx-toastr';
import { NgForm, NgModel } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponseDto } from 'src/app/models/errorResponseDto';
import { ErrorType } from 'src/app/enum/ErrorType';

@Component({
    selector: 'profilesettings-profilePage',
    templateUrl: './profileSettingsProfilePage.component.html',
    providers: [
        ProfilesHttpService,
        ProfileHttpService
    ]
})
export class ProfileSettingsProfilePageComponent {
    @ViewChild("profileEditForm") profileEditForm : NgForm;
    @ViewChild("file") avatarFileInputField : NgModel;
    @ViewChild("firstname") firstnameField : NgModel;
    @ViewChild("lastname") lastnameField : NgModel;

    profile = new ProfileEditDto();
    avatarFile: File;
    avatarFileLink: string | ArrayBuffer;

    isProfileUpdating: boolean;
    isAvatarUpdating: boolean;
    
    isAvatarPreviewLoading: boolean;

    get isUpdating() {
        return this.isAvatarUpdating || this.isProfileUpdating;
    }

    constructor(
        public currentUserService: CurrentUserService,
        private profilesService: ProfilesHttpService,
        private profileService: ProfileHttpService,
        private toastrService: ToastrService
    ) { 
        
    }

    ngOnInit(): void {
        this.profile.firstname = this.currentUserService.currentUser.profile.firstname;
        this.profile.lastname = this.currentUserService.currentUser.profile.lastname;
        this.avatarFileLink = this.profilesService.getAvatarLink(this.currentUserService.currentUser.id);
    }

    startProfileUpdating() {
        if (this.profile.firstname == "")
            this.profile.firstname = null;
        if (this.profile.lastname == "")
            this.profile.lastname = null;

        if (this.profile.firstname != this.currentUserService.currentUser.profile.firstname ||
            this.profile.lastname != this.currentUserService.currentUser.profile.lastname) {
            this.isProfileUpdating = true;

            this.profileService.editProfile(this.profile).subscribe(
                data => {
                    this.currentUserService.currentUser.profile.firstname = this.profile.firstname;
                    this.currentUserService.currentUser.profile.lastname = this.profile.lastname;
                    this.toastrService.success("Profile information successfully changed. You will see changes after page reload.");
                },
                (error: HttpErrorResponse) => {
                    const er = error.error as ErrorResponseDto;
                    switch (ErrorType[er.error.type]) {
                        case ErrorType.MODEL_NOT_VALID:
                            er.errors.forEach(el => {
                                this.profileEditForm.controls[el.param].setErrors({
                                    'validationError': true
                                })
                            })
                            return;
                    }

                    this.toastrService.error("Something went wrong while updating profile information.");
                }
            ).add(
                () => { 
                    this.isProfileUpdating = false;
                }
            );
        }

        if (this.avatarFileLink == null) {
            this.isAvatarUpdating = true;
            this.profileService.deleteAvatar().subscribe(
                data => {
                    this.toastrService.success("Avatar successfully deleted. You will see changes after page reload.");
                },
                error => {
                    this.toastrService.error("Something went wrong while deleting your avatar.");
                }
            ).add(
                () => {
                    this.isAvatarUpdating = false;
                }
            )
        }
        else if (this.avatarFileLink != this.profilesService.getAvatarLink(this.currentUserService.currentUser.id)) {
            this.isAvatarUpdating = true;
            this.profileService.uploadAvatar(this.avatarFile).subscribe(
                data => {
                    this.toastrService.success("Avatar successfully changed. You will see changed after page reload.");
                },
                (error: HttpErrorResponse) => {
                    const er = error.error as ErrorResponseDto;
                    switch (ErrorType[er.error.type]) {
                        case ErrorType.INPUT_IMAGE_INVALID:
                            this.avatarFileInputField.control.setErrors({
                                'invalidFile': true,
                            });
                            return;
                        case ErrorType.MODEL_NOT_VALID:
                            er.errors.forEach(el => {
                                this.profileEditForm.controls[el.param].setErrors({
                                    'validationError': true
                                })
                            })
                            return;
                    }

                    this.toastrService.error("Something went wrong while changing your avatar.");
                }
            ).add(
                () => {
                    this.isAvatarUpdating = false;
                }
            )
        }
    }

    onAvatarFileChanged(event) {
        if(event.target.files.length > 0) {
            const file = (event.target.files[0] as File);
            this.avatarFile = file;
            this.isAvatarPreviewLoading = true;

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (_event) => {
                this.avatarFileLink = reader.result;
                this.isAvatarPreviewLoading = false;
            }
        }
        else {
            this.avatarFile = null;
            this.avatarFileLink = this.profilesService.getAvatarLink(this.currentUserService.currentUser.id);
        }
    }

    performSetAvatar() {
        const input = document.getElementById("file");
        input.click();
    }

    deleteAvatar() {
        this.avatarFileLink = null;
        this.avatarFile = null;
        this.avatarFileInputField.control.setErrors({
            'invalidFile': null
        });
        this.avatarFileInputField.control.updateValueAndValidity();
    }
}
