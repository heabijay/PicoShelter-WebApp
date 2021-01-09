import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ProfileInfoDto } from '../models/profileInfoDto';

@Injectable()
export class ProfilesDataService {
    private subject = new Subject<ProfileInfoDto>();
    private lastData: ProfileInfoDto;

    sendData(data: ProfileInfoDto) {
        this.lastData = data;
        this.subject.next(data);
    }

    clearData() {
        this.lastData = null;
        this.subject.next();
    }

    getData() : Observable<ProfileInfoDto> {
        return this.subject.asObservable();
    }

    getLastReceivedData() : ProfileInfoDto {
        return this.lastData;
    }
}