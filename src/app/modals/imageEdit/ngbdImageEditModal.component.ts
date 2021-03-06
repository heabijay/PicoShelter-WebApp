import { Component, Input } from "@angular/core"
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap"
import { ImageEditDto } from "src/app/models/imageEditDto";
import { ImageInfoDto } from "../../models/imageInfoDto";
import { ImagesHttpService } from "../../services/imagesHttpService";

@Component({
    selector: "ngbd-profileimageedit-modal",
    templateUrl: "./ngbdImageEditModal.component.html",
    providers: [
        ImagesHttpService
    ]
})
export class NgbdImageEditModalComponent {
    @Input()imageInfoDto: ImageInfoDto;
    isProceeding: boolean;

    dto = new ImageEditDto();
    isSuccess?: boolean;

    constructor(
        public activeModal: NgbActiveModal,
        private imagesService: ImagesHttpService
    ) {

    }

    ngOnInit(): void {
        this.dto.title = this.imageInfoDto.title;
        this.dto.isPublic = this.imageInfoDto.isPublic;
        this.dto.isChangeLifetime = false;
        this.dto.deleteInHours = 0;
    }

    update() {
        if (this.dto.title != this.imageInfoDto.title ||
            this.dto.isChangeLifetime ||
            this.dto.isPublic != this.imageInfoDto.isPublic) {
            
            this.isProceeding = true;
            
            let _dto = this.dto;
            if (_dto.deleteInHours == 0)
                _dto.deleteInHours = null;

            this.imagesService.editImage(this.imageInfoDto.imageCode, _dto).subscribe(
                data => {
                    this.isSuccess = true;
                },
                error => {
                    this.isSuccess = false;
                }
            ).add(
                () => {
                    this.isProceeding = false;
                    this.close();
                }
            )
        }
        else {
            this.close();
        }
    }

    close() {
        this.activeModal.close(this.isSuccess);
    }
}