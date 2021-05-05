import { Component, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ConfirmationHttpService } from "../services/confirmationHttp.service"
import { ConfirmationType } from "../enum/confirmationType"
import { HttpErrorResponse } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { NgModel } from "@angular/forms";
import { ErrorResponseDto } from "../models/errorResponseDto";
import { ErrorType } from "../enum/errorType";
import { TranslateService } from "@ngx-translate/core";

@Component({
    templateUrl: "./confirm.component.html",
    providers: [
        ConfirmationHttpService
    ]
})
export class ConfirmComponent {
    ConfirmationType = ConfirmationType;

    paramSubscription : Subscription;
    isKeyEntered: boolean = false;
    isInfoLoading: boolean = false;
    confirmationType: ConfirmationType;
    isConfirmationActivated: boolean = false;
    isConfirmationActivating: boolean = false;
    key: string;

    changePasswordNew: string;
    isPasswordProceeding: boolean;

    @ViewChild("keyInput") keyField : NgModel;

    get confirmationTypeStr() {
        switch (this.confirmationType) {
            case ConfirmationType.EmailChanging: return this.translateService.instant("confirm.type.EmailChanging");
            case ConfirmationType.EmailChangingNew: return this.translateService.instant("confirm.type.EmailChangingNew");
            case ConfirmationType.EmailRegistration: return this.translateService.instant("confirm.type.EmailRegistration");
            case ConfirmationType.PasswordRestore: return this.translateService.instant("confirm.type.PasswordRestore");
            case ConfirmationType.AlbumInvite: return this.translateService.instant("confirm.type.AlbumInvite");
            default: "Unknown type";
        }
    }

    constructor(
        private activatedRoute: ActivatedRoute, 
        private router: Router,
        private confirmationService: ConfirmationHttpService,
        private toastrService: ToastrService,
        private translateService: TranslateService
    ) {
        this.paramSubscription = this.activatedRoute.queryParams.subscribe(param => 
        {
            this.key = param["key"];

            if (this.key?.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/g)) {
                this.loadInfo();
            }
        });
    }

    redirectToActivate() {
        this.router.navigate(
            [],
            {
                relativeTo: this.activatedRoute,
                queryParams: {
                    "key": this.key
                }
            }
        );
    }

    loadInfo() {
        this.isKeyEntered = true;
        this.isInfoLoading = true;
        this.confirmationType = null;

        this.confirmationService.getInfo(this.key).subscribe(
            data => {
                if (data.success) {
                    this.confirmationType = ConfirmationType[data.data.type];
                    if (this.confirmationType != ConfirmationType.PasswordRestore) {
                        this.defaultAttemptConfirm();
                    }
                }
            },
            (e: HttpErrorResponse) => {
                this.isKeyEntered = false;

                switch (e.status) {
                    case 401:
                        this.keyField.control.setErrors({
                            'needAuthorize': true,
                        });
                        return;
                    case 404:
                        this.keyField.control.setErrors({
                            'notFound': true,
                        });
                        return;
                }

                this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
            }
        ).add(
            () => {
                this.keyField.control.markAsTouched();
                this.isInfoLoading = false;
            }
        );
    }

    defaultAttemptConfirm() {
        this.isConfirmationActivating = true;
        this.confirmationService.confirm(this.key).subscribe(
            data => {
                this.isConfirmationActivated = true;

                switch (this.confirmationType)
                {
                    case ConfirmationType.EmailRegistration:
                        this.toastrService.success(this.translateService.instant("confirm.toastr.onSuccess.EmailRegistration"));
                        this.router.navigateByUrl("/login");
                        break;
                    case ConfirmationType.EmailChanging:
                        this.toastrService.success(this.translateService.instant("confirm.toastr.onSuccess.EmailChanging"));
                        break;
                    case ConfirmationType.EmailChangingNew:
                        this.toastrService.success(this.translateService.instant("confirm.toastr.onSuccess.EmailChangingNew"));
                        break;
                    case ConfirmationType.AlbumInvite:
                        this.toastrService.success(this.translateService.instant("confirm.toastr.onSuccess.AlbumInvite"));
                        break;
                    default:
                        this.toastrService.success(this.translateService.instant("confirm.toastr.onSuccess.default"));
                        break;
                }
            },
            (e: HttpErrorResponse) => {
                let error = e.error as ErrorResponseDto;
                this.isKeyEntered = false;

                if (e.status == 404) {
                    this.ConfirmationType = null;
                    this.keyField.control.setErrors({
                        'notFound': true,
                    });
                    return;
                }

                switch (ErrorType[error?.error?.type]) {
                    case ErrorType.CONFIRMATIONTYPE_UNSUPPORTED:
                        this.toastrService.info(this.translateService.instant("confirm.toastr.onError.CONFIRMATIONTYPE_UNSUPPORTED"));
                        return;
                    case ErrorType.CURRENT_EMAIL_WAS_ALREADY_CHANGED:
                        this.toastrService.error(this.translateService.instant("confirm.toastr.onError.CURRENT_EMAIL_WAS_ALREADY_CHANGED"));
                        return;
                    case ErrorType.EMAIL_ALREADY_REGISTERED:
                        this.toastrService.error(this.translateService.instant("confirm.toastr.onError.EMAIL_ALREADY_REGISTERED"));
                        return;
                }

                this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
            }
        ).add(
            () => {
                this.isConfirmationActivating = false;
            }
        );
    };

    changePassword() {
        this.isPasswordProceeding = true;
        this.confirmationService.confirmNewPwd(this.key, this.changePasswordNew).subscribe(
            data => {
                this.isConfirmationActivated = true;

                this.toastrService.success(this.translateService.instant("confirm.toastr.onSuccess.PasswordRestore"));
                this.router.navigateByUrl("/login");
            },
            (e: HttpErrorResponse) => {
                let error = e.error as ErrorResponseDto;
                this.isKeyEntered = false;
                
                if (e.status == 404) {
                    this.ConfirmationType = null;
                    this.keyField.control.setErrors({
                        'notFound': true,
                    });
                    return;
                }

                this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
            }
        ).add(
            () => {
                this.isPasswordProceeding = false;
            }
        );
    }
}