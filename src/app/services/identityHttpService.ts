import { Injectable } from "@angular/core";
import { HttpService } from "./httpService";
import { UserLoginDto } from "../models/userLoginDto";
import { UserLoginByEmailDto } from "../models/userLoginByEmailDto";


@Injectable()
export class IdentityHttpService {
    subPath = "/api/Auth";

    constructor(private httpService: HttpService) {
        
    }

    login(userLoginDto: UserLoginDto) {
        return this.httpService.httpClient.post(
            this.httpService.serverUrl + this.subPath + "/login",
            userLoginDto
        );
    }

    loginByEmail(userLoginByEmailDto: UserLoginByEmailDto) {
        return this.httpService.httpClient.post(
            this.httpService.serverUrl + this.subPath + "/elogin",
            userLoginByEmailDto
        );
    }
}