import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LabResultService } from 'app/services/lab-result.service';
import { UserService } from 'app/core/user/user.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-lab-report-detail',
    templateUrl: './lab-report-detail.component.html',
})
export class LabReportDetailComponent implements OnInit {
    isLoaded = false;

    resultId!: string;

    data!: any;

    categories: any = [];

    subCat: any = {};

    labTests: any = {};

    displayHeader = true;

    signatureInBottom = false;

    role!: string;
    userId!: string;

    constructor(
        private _labResultService: LabResultService,
        private _route: ActivatedRoute,
        private _userService: UserService,
        private sanitizer: DomSanitizer,
    ) {}

    ngOnInit(): void {
        this._userService.get().subscribe((result) => {
            this.role = result.role;
            this.userId = result.id;

            this._route.params.subscribe(({ id }) => {
                this.resultId = id;
                this.loadData();
            });
        });
    }

    loadData() {
        this._labResultService
            .findById(this.resultId)
            .subscribe((data: any) => {
                this.data = data;
                this.processData();
            });
    }

    processData() {
        let labTests: any = {};
        let subCat: { [key: string]: string[] } = {};
        this.data.items.forEach((item: any) => {
            item._show = false;
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
        this.isLoaded = true;
    }

    filterSubgroup(items: any, subgroup: string) {
        return items.filter((i: any) => i.subgroup === subgroup);
    }

    handlePrint() {
        window.print();
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

    selectAll(items: any, value: any) {
        if (Array.isArray(items)) {
            items.forEach((item: any) => {
                item._show = value;
            });
        } else {
            Object.values(items).forEach((values: any) => {
                values.forEach((item: any) => {
                    item._show = value;
                });
            });
        }
    }

    checkSelectAll(items: any) {
        if (Array.isArray(items)) {
            for (let item of items) {
                if (item._show) return true;
            }
            return false;
        }

        for (let values of Object.values(items)) {
            for (let item of <any>values) {
                if (item._show) return true;
            }
        }
        return false;
    }

    get displayItems() {
        return this.data?.items.filter((i) => i._show) || [];
    }

    checkEditPermission() {
        if (!this.data) return false;
        if (['admin', 'manager', 'lab-admin'].includes(this.role)) return true;
        if (this.role === 'lab-cashier' && this.userId === this.data.user.id)
            return true;
        return false;
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
        return value;
    }
}
