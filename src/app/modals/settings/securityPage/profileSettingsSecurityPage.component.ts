import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ErrorType } from 'src/app/enum/ErrorType';
import { ErrorResponseDto } from 'src/app/models/errorResponseDto';
import { UserChangePasswordDto } from 'src/app/models/userChangePasswordDto';
import { IdentityHttpService } from 'src/app/services/identityHttpService';
import { TokenService } from 'src/app/services/tokenService';

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

    changePwdDto = new UserChangePasswordDto();
    isPasswordChanging: boolean;
    isPasswordProceeding: boolean;

    constructor(
        private identityService: IdentityHttpService,
        private toastrService: ToastrService,
        private tokenService: TokenService,
        private router: Router
    ) {

    }

    startPasswordChanging() {
        this.isPasswordChanging = true;
    }

    closePasswordChanging() {
        this.isPasswordChanging = false;
        this.changePwdDto = new UserChangePasswordDto();
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
                if (er != null) {
                    switch (ErrorType[er.error.type]) {
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
            }
        ).add(
            
            () => {
                this.isPasswordProceeding = false;
            }
        );
    }
}
