import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { __LANG } from 'app/app.config';
import { UserService } from 'app/services/user.service';

@Component({
    selector: 'language',
    templateUrl: './language.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'language',
})
export class LanguageComponent implements OnInit {
    currentLang = '';

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _transloco: TranslocoService,
        private _userService: UserService,
    ) {}

    ngOnInit(): void {
        this._userService.getLocale().subscribe((result: any) => {
            this._transloco.setActiveLang(result.locale);
            localStorage.setItem(__LANG, result.locale);
            this._changeDetectorRef.markForCheck();
        });

        this._transloco.langChanges$.subscribe((lang) => {
            this.currentLang = lang;
            this._changeDetectorRef.markForCheck();
        });
    }

    changeLang(lang: string) {
        this._userService.setLocale(lang).subscribe();
        this._transloco.setActiveLang(lang);
        localStorage.setItem(__LANG, lang);
    }
}
