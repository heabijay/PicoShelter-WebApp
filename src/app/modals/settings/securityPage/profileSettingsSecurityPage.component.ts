import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ErrorType } from 'src/app/enum/ErrorType';
import { ErrorResponseDto } from 'src/app/models/errorResponseDto';
import { UserChangePasswordDto } from 'src/app/models/userChangePasswordDto';
import { IdentityHttpService } from 'src/app/services/identityHttp.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
    selector: 'profilesettings-securityPage',
    templateUrl: './profileSettingsSecurityPage.component.html',
    providers: [
        IdentityHttpService
    ]
})
export class ProfileSettingsSecurityPageComponent {
    @ViewChild("changePasswordForm") changePasswordForm: NgForm;
    @ViewChild("currentPassword") currentPasswordField: NgForm;

    @ViewChild("changeEmailForm") changeEmailForm: NgForm;
    @ViewChild("newEmailField") newEmailField: NgForm;

    changePwdDto = new UserChangePasswordDto();
    isPasswordChanging: boolean;
    isPasswordProceeding: boolean;
    
    currentEmail: string = null;
    isEmailChanging: boolean;
    isEmailProceeding: boolean;
    newEmail: string;

    get isSomeChanging() {
        return this.isPasswordChanging || this.isEmailChanging;
    }

    constructor(
        private identityService: IdentityHttpService,
        private toastrService: ToastrService,
        private tokenService: TokenService,
        private router: Router
    ) {

    }

    ngOnInit(): void {
        this.identityService.getEmail().subscribe(
            data => {
                if (data.success) {
                    this.currentEmail = data.data;
                }
            },
            error => {
                this.currentEmail = "[Something went wrong]";
            }
        )
    }

    closeChanging() {
        this.isPasswordChanging = false;
        this.isEmailChanging = false;
        this.newEmail = "";
        this.changePwdDto = new UserChangePasswordDto();
    }

    startPasswordChanging() {
        this.isPasswordChanging = true;
    }

    changePassword() {
        this.isPasswordProceeding = true;
        this.identityService.changePassword(this.changePwdDto).subscribe(
            data => {
                this.toastrService.success("Password changed! You will be redirected to login page", null, {
                    progressBar: false
                });
                this.tokenService.setTokenWithProfile(null);
                setTimeout(() => window.location.href = window.location.origin + "/login", 2000);
            },
            (error: HttpErrorResponse) => {
                const er = error.error as ErrorResponseDto;
                switch (ErrorType[er?.error?.type]) {
                    case ErrorType.MODEL_NOT_VALID:
                        er.errors.forEach(el => {
                            this.changePasswordForm.controls[el.param.toLowerCase()].setErrors({
                                'validationError': true,
                            });
                        })
                        return;
                    case ErrorType.CREDENTIALS_INCORRECT:
                        this.currentPasswordField.control.setErrors({
                            'incorrectCredentials': true,
                        });
                        return;
                }

                this.toastrService.error("Something went wrong. :(");
            }
        ).add(
            
            () => {
                this.isPasswordProceeding = false;
            }
        );
    }

    startEmailChanging() {
        this.isEmailChanging = true;
    }

    changeEmail() {
        this.isEmailProceeding = true;
        this.identityService.changeEmail(this.newEmail).subscribe(
            data => {
                this.toastrService.success("Instruction sent to your current email!");
                this.closeChanging();
            },
            (error: HttpErrorResponse) => {
                const er = error.error as ErrorResponseDto;
                switch (ErrorType[er?.error?.type]) {
                    case ErrorType.EMAIL_ALREADY_REGISTERED:
                        this.newEmailField.control.setErrors({
                            'alreadyRegistered': true,
                        });
                        return;
                }

                this.toastrService.error("Something went wrong. :(");
            }
        ).add(
            
            () => {
                this.isEmailProceeding = false;
            }
        );
    }
}
