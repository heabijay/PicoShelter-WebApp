import { Injectable } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { UserInfo } from "../models/userInfo";
import { TokenService } from "./tokenService";
import { IdentityHttpService } from "./identityHttpService";

var currentUser: UserInfo;
var onCurrentUserChanged = new Subject<UserInfo>();

@Injectable()
export class CurrentUserService {
    get onCurrentUserChanged() {
        return onCurrentUserChanged;
    }

    set currentUser(data: UserInfo) {
        currentUser = data;
        this.onCurrentUserChanged.next(data);
    }

    get currentUser() {
        return currentUser;
    }
}