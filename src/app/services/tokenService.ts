import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { AccessTokenDto } from "../models/accessTokenDto";
import { UserLoginData } from "../models/userLoginData";
import { CurrentUserService } from "./currentUserService";

@Injectable()
export class TokenService {

    constructor(private currentUserService: CurrentUserService) {

    }

    set access_token(data: AccessTokenDto) {
        if (data == null || data.access_token == null) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("access_token-expires");
        }
        else {
            localStorage.setItem("access_token", data.access_token);
            if (data.access_token_expires != null)
                localStorage.setItem("access_token-expires", new Date(data.access_token_expires).toISOString());
        }
    }

    setTokenWithProfile(data: UserLoginData) {
        this.access_token = new AccessTokenDto(
            data?.access_token,
            data?.expires
        );
        this.currentUserService.currentUser = data?.user;
    }

    get access_token() {
        let token = localStorage.getItem("access_token");
        let expires = localStorage.getItem("access_token-expires");

        if (token != null) {
            let expires_date: Date;
            if (expires != null) {
                expires_date = new Date(expires);

                if (expires_date < new Date()) {
                    this.access_token = null;
                    return null;
                }
            }

            return new AccessTokenDto(token, expires_date);
        }

        return null;
    }

    getHeaders() {
        let token = this.access_token;
        var headers = new HttpHeaders();
        if (token != null) {
            headers = headers.set("Authorization", "Bearer " + token.access_token);
        }
        
        return headers;
    }
}
