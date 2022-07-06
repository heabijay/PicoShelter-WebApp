import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { HttpService } from "../abstract/httpService"
import { SuccessResponseDto } from "../models/successResponseDto";
import { TokenService } from "./token.service";
import { ImageCommentDto } from "../models/imageCommentDto";
import { ImageInfoDto } from "../models/imageInfoDto";
import { ImageEditDto } from "../models/imageEditDto";
import { PaginationResultDto } from "../models/paginationResultDto";

@Injectable()
export class ImagesHttpService extends HttpService {

    constructor(protected httpClient: HttpClient, private identityService: TokenService) {
        super(httpClient)
    }

    getImageLink(code: string) {
        return this.serverUrl + "/i/" + code;
    }

    getImageDirectLink(code: string, ext: string) {
        return this.serverUrl + "/i/" + code + '.' + ext.replace("jpeg", "jpg");
    }

    getImageInfo(code: string) {
        return this.httpClient.get<SuccessResponseDto<ImageInfoDto>>(
            this.getImageLink(code),
            {
                headers: this.identityService.getHeaders()
            }
        );
    }

    getImageBlob(code: string, ext: string) : Observable<Blob> {
        return this.httpClient.get(
            this.getImageDirectLink(code, ext),
            {
                headers: this.identityService.getHeaders(),
                responseType: "blob"
            }
        );
    }

    getThumbnailBlob(code: string) : Observable<Blob> {
        return this.httpClient.get(
            this.getImageLink(code) + "/thumbnail.jpg", 
            {
                responseType: "blob",
                headers: this.identityService.getHeaders()
            }
        )
    }

    changePublicState(code: string, isPublic: boolean) {
        return this.httpClient.get(
            this.getImageLink(code) + "/share=" + isPublic,
            {
                headers: this.identityService.getHeaders()
            }
        );
    }

    deleteImage(code: string) {
        return this.httpClient.delete(
            this.getImageLink(code),
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    editImage(code: string, dto: ImageEditDto) {
        return this.httpClient.put(
            this.getImageLink(code),
            dto,
            {
                headers: this.identityService.getHeaders()
            }
        );
    }

    reportImage(code: string, comment: string) {
        return this.httpClient.post(
            this.getImageLink(code) + "/report",
            '"' + comment + '"',
            {
                headers: this.identityService.getHeaders().set("Content-Type", "application/json")
            }
        );
    }


    commentImage(code: string, comment: string) {
        return this.httpClient.post(
            this.getImageLink(code) + "/comment",
            '"' + comment + '"',
            {
                headers: this.identityService.getHeaders().set("Content-Type", "application/json")
            }
        );
    }

    getComments(code: string, starts?: number, count?: number) {
        let url = this.getImageLink(code) + '/comments?';
        if (starts != null)
            url += "starts=" + starts + "&";
        if (count != null)
            url += "count=" + count + "&";
        
        return this.httpClient.get<SuccessResponseDto<PaginationResultDto<ImageCommentDto>>>(
            url,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    deleteComment(code: string, commentId: number) {
        return this.httpClient.delete(
            this.getImageLink(code) + '/comment/' + commentId,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }
}