import { Component, Input } from "@angular/core"
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap"
import { ImagesHttpService } from "../../services/imagesHttp.service";

@Component({
    selector: "ngbd-profileimagedeleting-modal", 
    templateUrl: "./ngbdProfileImageDeletingModal.component.html",
    providers: [
        ImagesHttpService
    ]
})
export class NgbdProfileImageDeletingModalComponent {
    @Input()imageCodes: Array<string>;
    isProceeding: boolean;

    successCount: number = 0;
    failedCount: number = 0;

    get completedItems() {
        return this.successCount + this.failedCount;
    }

    constructor(
        public activeModal: NgbActiveModal,
        private imagesService: ImagesHttpService
    ) {

    }

    ngOnInit(): void {
        
    }

    delete() {
        this.isProceeding = true;
        this.imageCodes.forEach(el => {
            this.imagesService.deleteImage(el).subscribe(
                data => {
                    this.successCount++;
                },
                error => {
                    this.failedCount++;
                }
            ).add(
                () => {
                    if (this.completedItems >= this.imageCodes.length) {
                        this.isProceeding = false;
                        this.close();
                    }
                }
            )
        });
    }

    close() {
        this.activeModal.close({ success: this.successCount, failed: this.failedCount });
    }
}
