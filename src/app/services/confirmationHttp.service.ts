import { Injectable } from "@angular/core";
import { HttpService } from "../abstract/httpService";
import { TokenService } from "./token.service";
import { HttpClient } from "@angular/common/http"
import { SuccessResponseDto } from "../models/successResponseDto";
import { ConfirmationInfoDto } from "../models/confirmationInfoDto";

@Injectable()
export class ConfirmationHttpService extends HttpService {
    protected subPath = "/api/Confirmation";

    constructor(protected httpClient: HttpClient, private identityService: TokenService) {
        super(httpClient);
    }

    getInfo(key: string) {
        return this.httpClient.get<SuccessResponseDto<ConfirmationInfoDto>>(
            this.serverUrl + this.subPath + "/getinfo?key=" + key,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    confirm(key: string) {
        return this.httpClient.get(
            this.serverUrl + this.subPath + "/confirm?key=" + key,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    confirmNewPwd(key: string, newPwd: string) {
        return this.httpClient.post(
            this.serverUrl + this.subPath + "/confirm/newpwd?key=" + key,
            '"' + newPwd + '"',
            {
                headers: this.identityService.getHeaders().set("Content-Type", "application/json")
            }
        );
    }
}