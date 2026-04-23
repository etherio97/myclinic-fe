import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StatusChipComponent } from './components/status-chip/status-chip.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
    declarations: [StatusChipComponent],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTooltipModule],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        StatusChipComponent,
        MatTooltipModule,
    ],
})
export class SharedModule {}
