import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/services/currentUser.service';
import { ProfileHttpService } from 'src/app/services/profileHttp.service';


@Component({
    selector: 'profilesettings-designPage',
    templateUrl: './profileSettingsDesignPage.component.html',
    providers: [
        ProfileHttpService
    ]
})
export class ProfileSettingsDesignPageComponent {
    @ViewChild("changeProfileBackgroundForm") changeProfileBackgroundForm: NgForm;
    changeProfileBackgroundMode: string = "reset";

    changeProfileBackgroundGradientStart: string = "#000000";
    changeProfileBackgroundGradientEnd: string = "#ffffff";
    changeProfileBackgroundGradientDeg: number = 0;

    changeProfileBackgroundImageUrl: string;

    changeProfileBackgroundCssCode: string;
    
    isProfileBackgroundChanging: boolean;
    isProfileBackgroundProceeding: boolean;

    get isSomeChanging() {
        return this.isProfileBackgroundChanging;
    }
    get customCssBody(): string {
        return this.interpreteUserCssBody();
    }

    constructor(
        private profileService: ProfileHttpService,
        private toastr: ToastrService,
        private translate: TranslateService,
        public currentUser: CurrentUserService
    ) {

    }

    ngOnInit(): void {
        
    }

    startProfileBackgroundChanging() : void {
        this.isProfileBackgroundChanging = true;
    }

    closeChanging() : void {
        this.isProfileBackgroundChanging = false;
    }


    interpreteUserCssBody(): string {
        switch (this.changeProfileBackgroundMode) {
            case 'reset': return "";
            case 'gradient': return this.interpreteUserCssBodyFromGradient();
            case 'image': return this.interpreteUserCssBodyFromImage();
            case 'custom': return this.interpreteUserCssBodyFromCustomCode();
        }

        throw new Error('Interpreter is not found');
    }

    interpreteUserCssBodyFromGradient(): string {
        return `linear-gradient(${this.changeProfileBackgroundGradientDeg}deg, ${this.changeProfileBackgroundGradientStart} 0%, ${this.changeProfileBackgroundGradientEnd} 100%)`;
    }

    interpreteUserCssBodyFromImage(): string {
        return `url('${this.changeProfileBackgroundImageUrl}') center`;
    }

    interpreteUserCssBodyFromCustomCode(): string {
        return this.preventCssInjectionsClientSide(this.changeProfileBackgroundCssCode);
    }

    preventCssInjectionsClientSide(css: string): string {
        if (!css) return css;

        ['{', '}', ';'].forEach(c =>
        {
            const injectionIndex = css.indexOf(c);
            if (injectionIndex >= 0) {
                css = css.substring(0, injectionIndex);
            }
        });

        return css;
    }


    async changeBackgroundAsync() {
        this.isProfileBackgroundProceeding = true;
        try {
            const css = this.interpreteUserCssBody();
            this.profileService.editProfileBackgroundCss(css).toPromise();
            this.currentUser.currentUser.profile.backgroundCss = css;
            this.toastr.success("Background was successfully changed!");
            this.closeChanging();
        } catch (err) {
            this.toastr.error(this.translate.instant("shared.somethingWentWrong"));
            console.error(err);
        } finally {
            this.isProfileBackgroundProceeding = false;
        }
    }
}
