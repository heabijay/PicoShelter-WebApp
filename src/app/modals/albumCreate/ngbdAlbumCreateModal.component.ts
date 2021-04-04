import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, ViewChild } from "@angular/core"
import { NgModel } from "@angular/forms";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap"
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { ErrorType } from "src/app/enum/ErrorType";
import { AlbumInfoDto } from "src/app/models/albumInfoDto";
import { ErrorResponseDto } from "src/app/models/errorResponseDto";
import { AlbumsHttpService } from "src/app/services/albumsHttp.service";
import { AlbumCreateDto } from "../../models/albumCreateDto";
import { AlbumHttpService } from "../../services/albumHttp.service";
import { NgbdConfirmModalComponent } from "../confirm/ngbdConfirmModal.component";

@Component({
    selector: "ngbd-albumcreate-modal",
    templateUrl: "./ngbdAlbumCreateModal.component.html",
    providers: [
        AlbumHttpService,
        AlbumsHttpService
    ]
})
export class NgbdAlbumCreateModalComponent {
    @Input()targetCode?: string;
    @Input()targetDto?: AlbumCreateDto;

    @ViewChild("userCode")userCodeField: NgModel;
    isSetUsercodeCheck = false;

    dto = new AlbumCreateDto();
    isProceeding: boolean;

    isAlbumDeleting: boolean = false;

    result: AlbumInfoDto;

    get userCodeLink() {
        return window.location.origin + "/s/" + this.dto.userCode;
    }

    constructor(
        public activeModal: NgbActiveModal,
        private toastrService: ToastrService,
        private albumService: AlbumHttpService,
        private albumsService: AlbumsHttpService,
        private modalService: NgbModal,
        private translateService: TranslateService
    ) {

    }

    ngOnInit(): void {
        this.dto.isPublic = true;
        
        if (this.targetDto) {
            this.dto.isPublic = this.targetDto.isPublic;
            this.dto.title = this.targetDto.title;
            this.dto.userCode = this.targetDto.userCode;

            this.isSetUsercodeCheck = this.dto.userCode != null;
        }
    }

    create() {
        let _dto = this.dto;
        if (_dto.title == "")
            _dto.title = null;
        if (!this.isSetUsercodeCheck) {
            _dto.userCode = null;
        }

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
    
                        this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
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

    edit() {
        let _dto = this.dto;
        if (_dto.title == "")
            _dto.title = null;
        if (!this.isSetUsercodeCheck) {
            _dto.userCode = null;
        }

        if (this.targetDto?.title != _dto.title ||
            this.targetDto?.isPublic != _dto.isPublic ||
            this.targetDto?.userCode != _dto.userCode) {

            this.isProceeding = true;
            
            this.albumsService.edit(this.targetCode, _dto).subscribe(
                data => {
                    this.toastrService.success("Success!");
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
    
                        this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
                    }
                }
            ).add(
                () => {
                    this.isProceeding = false;
                    this.activeModal.close(true);
                }
            )
        }
        else {
            this.activeModal.close(true);
        }
    }

    confirm() {
        if (this.targetCode == null)
            this.create();
        else
            this.edit();
    }

    deleteAlbum() {
        const modalRef = this.modalService.open(NgbdConfirmModalComponent);
        modalRef.componentInstance.text = this.translateService.instant('modals.albumSettings.modals.areYouSureToDeleteAlbum'); 
        modalRef.result.then(
            result => {
                const r = result as boolean;

                if (r == true) {
                    this.isAlbumDeleting = true;
                    this.albumsService.delete(
                        this.targetCode
                    ).subscribe(
                        data => {
                            this.toastrService.success(this.translateService.instant('modals.albumSettings.toastr.albumDeleted'));
                            this.activeModal.close(true);
                        },
                        error => {
                            this.toastrService.error(this.translateService.instant('shared.somethingWentWrong'));
                        }
                    ).add(
                        () => this.isAlbumDeleting = false
                    );
                }
            },
            rejected => {
                
            }
        )
    }

    openMembers() {
        this.activeModal.close(false);
    }

    close() {
        this.activeModal.close(this.result);
    }
}