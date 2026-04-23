import { NgModule } from '@angular/core';
import { LayoutComponent } from 'app/layout/layout.component';
import { ClassicLayoutModule } from 'app/layout/layouts/classic/classic.module';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
    declarations: [LayoutComponent],
    imports: [SharedModule, ClassicLayoutModule],
    exports: [LayoutComponent, ClassicLayoutModule],
})
export class LayoutModule {}
