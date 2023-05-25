import { Component, Input } from "@angular/core"
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap"
import { ImagesHttpService } from "../../services/imagesHttp.service";

@Component({
    selector: "ngbd-profileimagereport-modal",
    templateUrl: "./ngbdImageReportModal.component.html",
    providers: [
        ImagesHttpService
    ]
})
export class NgbdImageReportModalComponent {
    @Input() imageCode: string;
    isProceeding: boolean;

    isSuccess?: boolean;

    comment?: string;

    constructor(
        public activeModal: NgbActiveModal,
        private imagesService: ImagesHttpService
    ) {

    }

    submit() {
        if (this.comment) {
            this.isProceeding = true;

            this.imagesService.reportImage(this.imageCode, this.comment)
                .subscribe(
                    data => this.isSuccess = true,
                    error => this.isSuccess = false
                ).add(() => {
                    this.isProceeding = false;
                    this.close();
                });
        }
        else {
            this.close();
        }
    }

    close() {
        this.activeModal.close(this.isSuccess);
    }
}