import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { HttpService } from "../abstract/httpService"
import { SuccessResponseDto } from "../models/successResponseDto";
import { TokenService } from "./tokenService";
import { ProfileInfoDto } from "../models/profileInfoDto";

@Injectable()
export class ImagesHttpService extends HttpService {

    constructor(protected httpClient: HttpClient, private identityService: TokenService) {
        super(httpClient)
    }

    getImageLink(code: string) {
        return this.serverUrl + "/i/" + code;
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
}