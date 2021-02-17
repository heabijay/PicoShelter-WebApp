import { Component, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ConfirmationHttpService } from "../services/confirmationHttpService"
import { ConfirmationType } from "../enum/confirmationType"
import { HttpErrorResponse } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { NgModel } from "@angular/forms";
import { ErrorResponseDto } from "../models/errorResponseDto";
import { ErrorType } from "../enum/ErrorType";

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
            case ConfirmationType.EmailChanging: return "Email changing (Step 1/2)";
            case ConfirmationType.EmailChangingNew: return "Email changing (Step 2/2)";
            case ConfirmationType.EmailRegistration: return "Account registration";
            case ConfirmationType.PasswordRestore: return "Password restore";
            default: "Unknown type";
        }
    }

    constructor(
        private activatedRoute: ActivatedRoute, 
        private router: Router,
        private confirmationService: ConfirmationHttpService,
        private toastrService: ToastrService
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

                this.toastrService.error("Something went wrong. :(");
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
                        this.toastrService.success("Account successfully registered!");
                        break;
                    case ConfirmationType.EmailChanging:
                        this.toastrService.success("Next instruction sent to your new email.");
                        break;
                    case ConfirmationType.EmailChangingNew:
                        this.toastrService.success("Email successfully changed.");
                        break;
                    default:
                        this.toastrService.success("Key successfully activated!");
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
                        this.toastrService.info("Sorry, this key could be activated.");
                        return;
                    case ErrorType.CURRENT_EMAIL_WAS_ALREADY_CHANGED:
                        this.toastrService.error("You already changed your email since create this request.");
                        return;
                    case ErrorType.EMAIL_ALREADY_REGISTERED:
                        this.toastrService.error("Selected email already registered.");
                        return;
                }

                this.toastrService.error("Something went wrong while attempted to confirm. :(");
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

                this.toastrService.success("Password successfully changed!");
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

                this.toastrService.error("Something went wrong while attempted to confirm. :(");
            }
        ).add(
            () => {
                this.isPasswordProceeding = false;
            }
        );
    }
}