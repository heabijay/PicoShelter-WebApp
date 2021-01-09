import { HttpClient, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpService } from "../abstract/httpService"
import { UploadImageDto } from "../models/uploadImageDto";
import { TokenService } from "../services/tokenService"

@Injectable() 
export class UploadHttpService extends HttpService {
    protected subPath = "/api/upload";

    constructor(protected httpClient: HttpClient, private identityService: TokenService) {
        super(httpClient);
    }

    uploadImage(dto: UploadImageDto) : Observable<HttpEvent<any>> {
        let formData = new FormData();
        formData.append('title', dto.title);
        formData.append('file', dto.file);
        dto.joinToAlbums.forEach(el => {
            formData.append('joinToAlbums', el.toString());
        });
        formData.append('deleteInHours', dto.deleteInHours.toString());
        formData.append('isPublic', dto.isPublic.toString());
        formData.append('quality', dto.quality.toString());
    
        return this.httpClient.post<HttpEvent<any>>(
            this.serverUrl + this.subPath, 
            formData, 
            {
                reportProgress: true,
                responseType: 'json'
            }
        );
    }
}