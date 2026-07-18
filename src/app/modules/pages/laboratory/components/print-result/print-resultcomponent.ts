import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-print-result',
    templateUrl: './print-result.component.html',
    styleUrls: ['./print-result.component.scss'],
})
export class PrintResultComponent implements OnInit, OnChanges {
    @Input() displayHeader!: boolean;

    @Input() signatureInBottom!: boolean;

    @Input() resultId!: string;

    @Input() data!: any;

    @Input() items!: any;

    categories: any = [];

    subCat: any = {};

    labTests: any = {};

    constructor(private sanitizer: DomSanitizer) {}

    ngOnInit(): void {
        this.processData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.items) {
            this.processData();
        }
    }

    processData() {
        let labTests: any = {};
        let subCat: { [key: string]: string[] } = {};
        this.items.forEach((item: any) => {
            if (!labTests[item.category]) {
                labTests[item.category] = { _uncategorized: [] };
                subCat[item.category] = [];
            }
            if (item.subgroup && !labTests[item.category][item.subgroup]) {
                labTests[item.category][item.subgroup] = [];
            }
            if (item.subgroup) {
                labTests[item.category][item.subgroup].push(item);
                if (!subCat[item.category].includes(item.subgroup)) {
                    subCat[item.category].push(item.subgroup);
                }
            } else {
                labTests[item.category]['_uncategorized'].push(item);
            }
        });
        this.categories = Object.keys(labTests);
        this.labTests = labTests;
        this.subCat = subCat;
    }

    calculateAge(dateOfBirth: string): number {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (
            monthDifference < 0 ||
            (monthDifference === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        return age;
    }

    getClassNameForFooter() {
        return {
            'absolute bottom-0 inset-x-0': this.signatureInBottom,
            'mt-12 grid grid-cols-2 gap-6 pt-6': !this.signatureInBottom,
        };
    }

    sanitize(html: string) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    showText(value: string) {
        if (value.includes('\n')) {
            return this.sanitizer.bypassSecurityTrustHtml(
                value.split('\n').join('<br/>'),
            );
        }
        return value || '—';
    }
}
