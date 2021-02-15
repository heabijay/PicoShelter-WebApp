import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { HttpService } from "../abstract/httpService"
import { SuccessResponseDto } from "../models/successResponseDto";
import { TokenService } from "./tokenService";
import { ProfileInfoDto } from "../models/profileInfoDto";
import { ImageCacheDto } from "../models/imageCacheDto";
import { ImageInfoDto } from "../models/imageInfoDto";
import { ImageEditDto } from "../models/imageEditDto";

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
}