import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DashboardService } from 'app/services/dashboard.service';
import moment from 'moment';

@Component({
    selector: 'app-manager-dashboard',
    templateUrl: './manager-dashboard.component.html',
})
export class ManagerDashboardComponent implements OnInit {
    formGroup!: FormGroup;

    searchData: any = {};

    constructor(
        private _fb: FormBuilder,
        private _dashboardService: DashboardService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            startDate: [moment()],
            endDate: [moment()],
        });

        this.reloadData();
    }

    reloadData() {
        this.fetchData(
            this.formGroup.controls.startDate.value,
            this.formGroup.controls.endDate.value,
        ).subscribe((data: any) => {
            this.searchData = data;
        });
    }

    private fetchData(startDate: any, endDate: any) {
        const condition: any = {};
        condition.startDate = moment.isMoment(startDate)
            ? startDate.format('yyyy-MM-DD')
            : moment.isMoment(startDate);
        condition.endDate = moment.isMoment(endDate)
            ? endDate.format('yyyy-MM-DD')
            : moment(endDate).format('yyyy-MM-DD');
        return this._dashboardService.getBatchAdmin(condition);
    }
}
