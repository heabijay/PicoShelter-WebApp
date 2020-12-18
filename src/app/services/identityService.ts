import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { UserLoginData } from "../models/userLoginData";

const itemName = "identity";

@Injectable()
export class IdentityService {
    onIdentityChanged: Subject<UserLoginData> = new Subject<UserLoginData>();

    getIdentity() : UserLoginData {
        return JSON.parse(localStorage.getItem(itemName));
    }

    setIdentity(data: UserLoginData) {
        localStorage.setItem(itemName, JSON.stringify(data));
        this.onIdentityChanged.next(data);
    }

    deleteIdentity() {
        localStorage.removeItem(itemName);
        this.onIdentityChanged.next(null);
    }

    isIdentitified() {
        return this.getIdentity() != null;
    }
}
