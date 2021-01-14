import { Injectable } from "@angular/core";
import { HttpService } from "../abstract/httpService";
import { TokenService } from "./tokenService";
import { HttpClient, HttpEvent } from "@angular/common/http"
import { ProfileEditDto } from "../models/profileEditDto"
import { Observable } from "rxjs";


@Injectable()
export class ProfileHttpService extends HttpService {
    protected subPath = "/api/Profile";

    constructor(protected httpClient: HttpClient, private identityService: TokenService) {
        super(httpClient);
    }

    editProfile(editedInfo: ProfileEditDto) {
        return this.httpClient.put(
            this.serverUrl + this.subPath + "/edit",
            editedInfo,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    uploadAvatar(file: File) {
        let formData = new FormData();
        formData.append('file', file);
    
        return this.httpClient.post(
            this.serverUrl + this.subPath + "/avatar", 
            formData, 
            {
                headers: this.identityService.getHeaders()
            }
        );
    }

    deleteAvatar() {
        return this.httpClient.delete(
            this.serverUrl + this.subPath + "/avatar",
            {
                headers: this.identityService.getHeaders()
            }
        )
    }
}