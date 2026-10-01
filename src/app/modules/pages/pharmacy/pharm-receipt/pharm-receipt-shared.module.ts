import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { TranslocoModule } from '@ngneat/transloco';
import { PharmacyReceiptItemComponent } from './components/pharmacy-receipt-item/pharmacy-receipt-item.component';

@NgModule({
    declarations: [PharmacyReceiptItemComponent],
    imports: [SharedModule],
    providers: [],
    exports: [PharmacyReceiptItemComponent],
})
export class PharmReceiptSharedModule {}
