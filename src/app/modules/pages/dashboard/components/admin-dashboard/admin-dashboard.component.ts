import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DashboardService } from 'app/services/dashboard.service';
import moment from 'moment';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
    formGroup!: FormGroup;

    prevDailyData: any = {};

    dailyData: any = {};

    monthlyData: any = {};

    prevMonthlyData: any = {};

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

        this.loadMonthlyData();
    }

    reloadData() {
        this.fetchData(
            this.formGroup.controls.startDate.value,
            this.formGroup.controls.endDate.value,
        ).subscribe((data: any) => {
            this.dailyData = data;
        });

        this.fetchData(
            moment(this.formGroup.controls.startDate.value).subtract(1, 'day'),
            moment(this.formGroup.controls.endDate.value).subtract(1, 'day'),
        ).subscribe((data: any) => {
            this.prevDailyData = data;
        });
    }

    loadMonthlyData() {
        this.fetchData(
            moment().startOf('month'),
            moment().endOf('month'),
        ).subscribe((data: any) => {
            this.monthlyData = data;
        });

        this.fetchData(
            moment().subtract(1, 'month').startOf('month'),
            moment().subtract(1, 'month').endOf('month'),
        ).subscribe((data: any) => {
            this.prevMonthlyData = data;
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

    int(s: string | number) {
        return typeof s === 'string' ? parseInt(s) : s;
    }
}
