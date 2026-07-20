import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-lab-input-item',
    templateUrl: './lab-input-item.component.html',
})
export class LabInputItemComponent implements OnInit {
    @Input() patient!: any;

    @Input() item!: any;

    @Input() value!: any;

    @Input() flag!: any;

    @Output() valueChange = new EventEmitter<string>();

    @Output() flagChange = new EventEmitter<string>();

    constructor(private sanitizer: DomSanitizer) {}

    ngOnInit(): void {
        if (!this.flag && this.item.flag) {
            this.flag = this.item.flag;
        }
        (<any>this.item).referenceText = this.getReferenceText();
    }

    onValueChange(newValue: string) {
        this.value = newValue;
        this.valueChange.emit(newValue);

        this.onFlagChange(this.getFlag());
    }

    onFlagChange(newValue: string) {
        (<any>this.item).flag = newValue;
        this.flag = newValue;
        this.flagChange.emit(newValue);
    }

    getFlag() {
        if (this.item.type !== 'numeric') return '';
        if (this.value === '') return '';
        let value = parseFloat(this.value);
        if (this.item.range) {
            if (value < this.item.range.low) return 'Low';
            if (value > this.item.range.high) return 'High';
            return 'Normal';
        }
        if (this.item.rangeMale && this.item.rangeFemale) {
            if (this.patient.gender === 'Male') {
                if (value < this.item.rangeMale.low) return 'Low';
                if (value > this.item.rangeMale.high) return 'High';
                return 'Normal';
            }
            if (value < this.item.rangeFemale.low) return 'Low';
            if (value > this.item.rangeFemale.high) return 'High';
            return 'Normal';
        }
        return this.flag || this.item.flag || '';
    }

    getReferenceText() {
        if (this.item.refText) {
            return this.item.refText;
        }
        if (this.item.range) {
            return `${this.item.range.low} - ${this.item.range.high}`;
        }
        if (this.item.rangeMale) {
            if (this.patient.gender === 'Male') {
                return `${this.item.rangeMale} - ${this.item.rangeMale}`;
            }
            return `${this.item.rangeFemale} - ${this.item.rangeFemale}`;
        }
        return '';
    }

    sanitize(html: string) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
