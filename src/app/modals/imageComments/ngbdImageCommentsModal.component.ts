import { Component, Input, OnDestroy } from "@angular/core"
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap"
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { ImageCommentDto } from "src/app/models/imageCommentDto";
import { CurrentUserService } from "src/app/services/currentUser.service";
import { ImagesHttpService } from "src/app/services/imagesHttp.service";
import { ProfilesHttpService } from "src/app/services/profilesHttp.service";
import { NgbdConfirmModalComponent } from "../confirm/ngbdConfirmModal.component";
import * as signalR from "@microsoft/signalr";
import { HttpService } from "src/app/abstract/httpService";

@Component({
    selector: "ngbd-imageComments-modal",
    templateUrl: "./ngbdImageCommentsModal.component.html",
    providers: [
        ImagesHttpService,
        ProfilesHttpService
    ]
})
export class NgbdImageCommentsModalComponent implements OnDestroy {
    @Input() imageCode: string;
    connection: signalR.HubConnection;

    isCommentSending: boolean = false;
    commentInput: string;

    commentsList: Array<ImageCommentDto>;
    commentsTotal: number;

    constructor(
        public activeModal: NgbActiveModal,
        public profilesService: ProfilesHttpService,
        public currentUser: CurrentUserService,
        private toastr: ToastrService,
        private translate: TranslateService,
        private images: ImagesHttpService,
        private modal: NgbModal
    ) {

    }

    ngOnInit(): void {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(this.images.serverUrl + "/live-comments", {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets 
            })
            .withAutomaticReconnect()
            .build();

        this.connection.on("comment-added", () => this.reloadCommentsAsync());
        this.connection.on("comment-deleted", () => this.reloadCommentsAsync());

        this.connection.onreconnected(async callback => 
        {
            await this.connection.send("SubscribeToImageAsync", this.imageCode);
            this.reloadCommentsAsync();
        });

        this.connection.start()
            .then(() => this.connection.send("SubscribeToImageAsync", this.imageCode))
            .finally(() => this.reloadCommentsAsync());
    }

    ngOnDestroy(): void {
        this.connection.stop();
    }


    addCommentIfNotExists(comment: ImageCommentDto) {
        if (!this.commentsList.find(t => t.id == comment.id)) {
            this.commentsList.push(comment);
        }
    }

    async reloadCommentsAsync(starts?: number, count?: number) {
        this.commentsList = null;
        await this.loadCommentsAsync();
    }

    async loadCommentsAsync(starts?: number, count: number = 20) {
        const comments = await this.images.getComments(this.imageCode, starts, count).toPromise();
        if (comments.success) {
            this.commentsTotal = comments.data.totalCount;
            if (this.commentsList == null)
                this.commentsList = new Array();
            comments.data.data.forEach(comment => this.addCommentIfNotExists(comment));
        }
    }

    async loadNextCommentsPageAsync() {
        await this.loadCommentsAsync(this.commentsList.length);
    }


    async sendCommentAsync(): Promise<void> {
        this.isCommentSending = true;
        try {
            await this.images.commentImage(this.imageCode, this.commentInput).toPromise();
            this.reloadCommentsAsync();
            this.commentInput = null;
        } catch {
            this.toastr.error(this.translate.instant("shared.somethingWentWrong"));
        } finally {
            this.isCommentSending = false;
        }
    }

    close() {
        this.activeModal.close(null);
    }

    async deleteCommentAsync(commentId: number) {
        const modalRef = this.modal.open(NgbdConfirmModalComponent, { centered: true });
        if (!await modalRef.result) return;

        try {
            await this.images.deleteComment(this.imageCode, commentId).toPromise();
            this.reloadCommentsAsync();
        } catch (err) {
            this.toastr.error(this.translate.instant("shared.somethingWentWrong"));
            throw err;
        }
    }
}