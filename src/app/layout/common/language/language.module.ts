import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { LanguageComponent } from 'app/layout/common/language/language.component';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
    declarations: [LanguageComponent],
    imports: [
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        SharedModule,
        MatDialogModule,
        MatInputModule,
    ],
    exports: [LanguageComponent],
})
export class LanguageModule {}
