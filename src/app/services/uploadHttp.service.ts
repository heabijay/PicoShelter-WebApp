import { HttpClient, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpService } from "../abstract/httpService"
import { UploadImageDto } from "../models/uploadImageDto";
import { TokenService } from "./token.service"

@Injectable() 
export class UploadHttpService extends HttpService {
    protected subPath = "/api/upload";

    constructor(protected httpClient: HttpClient, private identityService: TokenService) {
        super(httpClient);
    }

    uploadImage(dto: UploadImageDto, isAnonymously: boolean = false) : Observable<HttpEvent<any>> {
        let formData = new FormData();
        formData.append('title', dto.title == null ? "" : dto.title);
        formData.append('file', dto.file);
        dto.joinToAlbums?.forEach(el => {
            formData.append('joinToAlbums', el.toString());
        });

        if (dto.deleteInHours == 0)
            formData.append('deleteInHours', "");
        else 
            formData.append('deleteInHours', dto.deleteInHours.toString());
        
        formData.append('isPublic', dto.isPublic.toString());
        formData.append('quality', dto.quality.toString());
    
        return this.httpClient.post<HttpEvent<any>>(
            this.serverUrl + this.subPath, 
            formData, 
            {
                reportProgress: true,
                observe: 'events',
                headers: (isAnonymously ? null : this.identityService.getHeaders())
            }
        );
    }
}