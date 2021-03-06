import { Component, ViewChild } from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";
import { UploadImageDto } from "../models/uploadImageDto";
import { CurrentUserService } from "../services/currentUserService";
import { UploadHttpService } from "../services/uploadHttpService";
import { HttpErrorResponse, HttpEvent, HttpEventType } from "@angular/common/http";
import { SuccessResponseDto } from "../models/successResponseDto";
import { ImageInfoDto } from "../models/imageInfoDto";
import { ErrorResponseDto } from "../models/errorResponseDto";
import { ToastrService } from "ngx-toastr";
import { ErrorType } from "../enum/ErrorType";
import { ImagesHttpService } from "../services/imagesHttpService";
import { copyToClipboard } from "../static/copyToClipboard"
import { Router } from "@angular/router";
import { UploadExitGuard } from "../guards/upload.exit.guard";
import { Observable } from "rxjs";
import { ComponentCanDeactivate } from "../guards/componentCanDeactivate";

@Component({
    templateUrl: "./upload.component.html",
    providers: [
        UploadHttpService,
        ImagesHttpService
    ]
})
export class UploadComponent implements UploadExitGuard {
    @ViewChild("uploadForm") uploadForm: NgForm;
    @ViewChild("file") fileField: NgModel;
    @ViewChild("deleteInHours") deleteInHoursField: NgModel;
    @ViewChild("quality") qualityField: NgModel;

    isAnonymous: boolean;
    dto = new UploadImageDto();
    selectedFilename: string = "Choose file...";
    previewImageUrl: any;

    isUploading : boolean;
    isUploaded: boolean;
    uploadedInfo: ImageInfoDto;

    get uploadedLink() {
        return window.location.origin + "/i/" + this.uploadedInfo?.imageCode;
    }

    get uploadedDirectLink() {
        return this.imagesService.getImageDirectLink(this.uploadedInfo.imageCode, this.uploadedInfo.imageType)
    }

    progress: number = 0;

    constructor(
        public currentUserService: CurrentUserService,
        private uploadService: UploadHttpService,
        private imagesService: ImagesHttpService,
        private toastrService: ToastrService,
        private router: Router
    ) {
        
    }
    canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {  
        if (this.isUploading && !this.isUploaded) {
            return confirm("File is still uploading. Are you sure you want leave?")
        }
        else {
            return true;
        }
    }

    ngOnInit(): void {
        this.dto.deleteInHours = 0;
        this.dto.quality = 75;
        this.dto.isPublic = false;

        if (this.currentUserService.currentUser == null)
        {
            this.isAnonymous = true;
            this.onAnonymousCheckChanged();
        }
    }

    onFileInputChanged(event) {
        if(event.target.files.length > 0) {
            const file = (event.target.files[0] as File);

            if (file.size >= 10 * 1024 * 1024) {
                this.fileField.control.setErrors({
                    'sizeOverflow': true
                });
                return;
            };
            
            this.dto.file = file;
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (_event) => {
                this.previewImageUrl = reader.result;
            }
        }
        else {
            this.dto.file = null;
            this.previewImageUrl = null;
        }
    }

    onAnonymousCheckChanged() {
        if (this.isAnonymous) {
            this.dto.isPublic = true;
            if (this.dto.deleteInHours == 0)
                this.dto.deleteInHours = 720;

            if (this.dto.quality > 75)
                this.dto.quality = 75;
        } 
        else {
            this.qualityField.control.setErrors({
                'qualityForbidden': null
            });
            this.qualityField.control.updateValueAndValidity();

            this.deleteInHoursField.control.setErrors({
                'lifetimeForbidden': null
            });
            this.deleteInHoursField.control.updateValueAndValidity();
        }
    }

    onQualityChanged() {
        if (this.isAnonymous && this.dto.quality > 75) {
            this.qualityField.control.setErrors({
                'qualityForbidden': true
            });
        }
    }

    onDeleteInHoursChanged() {
        if (this.isAnonymous && this.dto.deleteInHours == 0) {
            this.deleteInHoursField.control.setErrors({
                'lifetimeForbidden': true
            });
        }
    }

    upload() {
        this.uploadForm.control.markAllAsTouched();
        this.isUploading = true;

        const sub = this.uploadService.uploadImage(this.dto, this.isAnonymous).subscribe(
            event => {                
                if (event.type == HttpEventType.UploadProgress) {
                    this.progress = Math.round(100 * event.loaded / event.total);
                }
                else if (event.type == HttpEventType.Response) {
                    const response = event.body as SuccessResponseDto<ImageInfoDto>;
                    if (response.success) {
                        this.uploadedInfo = response.data;
                        this.isUploaded = true;
                    }

                    this.isUploading = false;
                };
            },
            (er : HttpErrorResponse) => {
                this.isUploading = false;
                let error = er.error as ErrorResponseDto;
                if (error) {
                    switch (ErrorType[error.error.type]) {
                        case ErrorType.MODEL_NOT_VALID:
                            error.errors.forEach(el => {
                                this.uploadForm.controls[el.param].setErrors({
                                    'validationError': true
                                });
                            });
                            return;
                        case ErrorType.UNREGISTERED_QUALITY_FORBIDDEN:
                            this.qualityField.control.setErrors({
                                'qualityForbidden': true
                            });
                            return;
                        case ErrorType.UNREGISTERED_DELETEIN_FORBIDDEN:
                            this.deleteInHoursField.control.setErrors({
                                'lifetimeForbidden': true
                            });
                            return;
                        case ErrorType.INPUT_IMAGE_INVALID:
                            this.fileField.control.setErrors({
                                'invalidFile': true
                            });
                            return;
                    }
                }

                this.toastrService.error("Something went wrong. :(");
            }
        );
    }

    copyLink() {
        copyToClipboard(this.uploadedLink);
        this.toastrService.success("Copied!");
    }

    copyDirectLink() {
        copyToClipboard(this.uploadedDirectLink);
        this.toastrService.success("Copied!");
    }

    reinit() {
        this.router.navigateByUrl("/not-found", { skipLocationChange: true }).then(() => {
            this.router.navigateByUrl("/upload");
        })
    }
}