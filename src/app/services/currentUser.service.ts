import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { UserInfo } from "../models/userInfo";

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