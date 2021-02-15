import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, ViewChild } from "@angular/core"
import { NgModel } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap"
import { ToastrService } from "ngx-toastr";
import { ErrorType } from "src/app/enum/ErrorType";
import { AlbumInfoDto } from "src/app/models/albumInfoDto";
import { ErrorResponseDto } from "src/app/models/errorResponseDto";
import { AlbumCreateDto } from "../../models/albumCreateDto";
import { AlbumHttpService } from "../../services/albumHttpService";

@Component({
    selector: "ngbd-albumcreate-modal",
    templateUrl: "./ngbdAlbumCreateModal.component.html",
    providers: [
        AlbumHttpService
    ]
})
export class NgbdAlbumCreateModalComponent {
    @Input()targetId?: number;
    @Input()targetDto?: AlbumCreateDto;

    @ViewChild("userCode")userCodeField: NgModel;
    @ViewChild("isSetUsercode")isSetUsercodeCheck: NgModel;

    dto = new AlbumCreateDto();
    isProceeding: boolean;

    result: AlbumInfoDto;

    get userCodeLink() {
        return window.location.origin + "/s/" + this.dto.userCode;
    }

    constructor(
        public activeModal: NgbActiveModal,
        private toastrService: ToastrService,
        private albumService: AlbumHttpService
    ) {

    }

    ngOnInit(): void {
        this.dto.isPublic = true;
        
        if (this.targetDto) {
            this.dto = this.targetDto;
        }
    }

    create() {
        let _dto = this.dto;
        if (_dto.title == "")
            _dto = null;
        if (!this.isSetUsercodeCheck.value) {
            _dto.userCode = null;
        }

        if (this.targetId == null ||
            this.targetDto?.title != _dto.title ||
            this.targetDto?.isPublic != _dto.isPublic ||
            this.targetDto?.userCode != _dto.userCode) {

            this.isProceeding = true;
            this.albumService.create(_dto).subscribe(
                data => {
                    if (data.success) {
                        this.result = data.data;
                    }
                },
                (error: HttpErrorResponse) => {
                    const er = error.error as ErrorResponseDto;
                    if (er != null) {
                        switch (ErrorType[er.error.type]) {
                            case ErrorType.USERCODE_ALREADY_TAKED:
                                this.userCodeField.control.setErrors({
                                    'alreadyRegistered': true,
                                });
                                return;
                        }
    
                        this.toastrService.error("Something went wrong. :(");
                    }
                }
            ).add(
                () => {
                    this.isProceeding = false;
                    if (this.result)
                        this.close();
                }
            )
        }
        else {
            this.close();
        }
    }

    close() {
        this.activeModal.close(this.result);
    }
}