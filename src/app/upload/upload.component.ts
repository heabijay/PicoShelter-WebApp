import { Component, ViewChild } from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";
import { UserInfo } from "../models/userInfo";
import { UploadImageDto } from "../models/uploadImageDto";
import { CurrentUserService } from "../services/currentUserService";

@Component({
    templateUrl: "./upload.component.html"
})
export class UploadComponent {
    @ViewChild("uploadForm") uploadForm: NgForm;
    @ViewChild("file") targetFileField: NgModel;
    @ViewChild("deleteInHours") deleteInHoursField: NgModel;
    @ViewChild("quality") qualityField: NgModel;

    isAnonymous: boolean = false;
    dto = new UploadImageDto();
    selectedFilename: string = "Choose file...";
    previewImageUrl: any;

    constructor(
        public currentUserService: CurrentUserService
    ) {
        
    }

    ngOnInit(): void {
        this.dto.deleteInHours = 0;
        this.dto.quality = 95;

        if (this.currentUserService.currentUser == null)
            this.onAnonymousCheckChanged();
    }

    onFileInputChanged(event) {
        if(event.target.files.length > 0) {
            const file = (event.target.files[0] as File);
            this.dto.file = file;

            if (file.size >= 10 * 1024 * 1024) {
                this.targetFileField.control.setErrors({
                    'sizeOverflow': true
                });
                return;
            };

            var reader = new FileReader();
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

            if (this.dto.quality > 95)
                this.dto.quality = 95;
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
        if (this.isAnonymous && this.dto.quality > 95) {
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
    }
}