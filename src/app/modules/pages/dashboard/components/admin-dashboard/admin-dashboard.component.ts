import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DashboardService } from 'app/services/dashboard.service';
import { cloneDeep } from 'lodash';
import moment from 'moment';

const CHART_VISITORS = {
    chart: {
        width: '100%',
        height: '100%',
        type: 'bar',
        toolbar: { show: false },
        zoom: { enabled: false },
    },
    colors: ['#35bbbd'],
    plotOptions: {
        bar: {
            dataLabels: {
                position: 'top',
            },
        },
    },
    dataLabels: {
        enabled: true,
        offsetY: -20,
        style: {
            fontSize: '12px',
            colors: ['#CBD5E1'],
        },
    },
    grid: {
        show: true,
        borderColor: '#334155',
        position: 'back',
        xaxis: {
            lines: {
                show: true,
            },
        },
        yaxis: {
            lines: {
                show: true,
            },
        },
    },
    series: [],
    tooltip: {
        followCursor: true,
        theme: 'dark',
        x: {
            format: 'MMM dd, yyyy',
        },
        y: {
            formatter: (value: number): string => `${value}`,
        },
    },
    xaxis: {
        labels: {
            style: {
                colors: '#CBD5E1',
            },
        },
        tooltip: {
            enabled: false,
        },
        type: 'datetime',
    },
    yaxis: {
        labels: {
            offsetY: -20,
            style: {
                colors: '#CBD5E1',
            },
        },
        max: (max: number): number => max + 1,
        tickAmount: 1,
        show: false,
    },
};

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

    chartVisitors: any = CHART_VISITORS;

    constructor(
        private _fb: FormBuilder,
        private _dashboardService: DashboardService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            monthly: [moment()],
            daily: [moment()],
        });

        this.formGroup.controls.monthly.valueChanges.subscribe(() => {
            this.reloadMonthlyData();
            this.reloadPatientCountByDate();
        });

        this.formGroup.controls.daily.valueChanges.subscribe(() => {
            this.reloadDailyData();
        });

        this.reloadDailyData();
        this.reloadMonthlyData();
        this.reloadPatientCountByDate();
    }

    reloadDailyData() {
        const value = cloneDeep(this.formGroup.controls.daily.value);
        const date = moment.isMoment(value) ? value : moment(value);
        this.fetchData(cloneDeep(date), cloneDeep(date)).subscribe(
            (data: any) => {
                this.dailyData = data;
            },
        );
        this.fetchData(
            cloneDeep(date).subtract(1, 'day'),
            cloneDeep(date).subtract(1, 'day'),
        ).subscribe((data: any) => {
            this.prevDailyData = data;
        });
    }

    reloadMonthlyData() {
        const value = cloneDeep(this.formGroup.controls.monthly.value);
        const date = moment.isMoment(value) ? value : moment(value);
        this.fetchData(
            cloneDeep(date).startOf('month'),
            cloneDeep(date).endOf('month'),
        ).subscribe((data: any) => {
            this.monthlyData = data;
        });
        date.subtract(1, 'month');
        this.fetchData(
            cloneDeep(date).startOf('month'),
            cloneDeep(date).endOf('month'),
        ).subscribe((data: any) => {
            this.prevMonthlyData = data;
        });
    }

    reloadPatientCountByDate() {
        const value = cloneDeep(this.formGroup.controls.monthly.value);
        const date = moment.isMoment(value) ? value : moment(value);
        this._dashboardService
            .getPatientCountByDate({
                startDate: cloneDeep(date)
                    .startOf('month')
                    .format('yyyy-MM-DD'),
                endDate: cloneDeep(date).endOf('month').format('yyyy-MM-DD'),
            })
            .subscribe((data: any) => {
                this.chartVisitors.series = [
                    {
                        name: 'Patients',
                        data: data.map((item: any) => ({
                            x: moment(item.visit_date).format('yyyy-MM-DD'),
                            y: item.unique_patient_count,
                        })),
                    },
                ];
            });
    }

    private fetchData(startDate: any, endDate: any) {
        return this._dashboardService.getBatchAdmin({
            startDate: (moment.isMoment(startDate)
                ? startDate
                : moment(startDate)
            ).format('yyyy-MM-DD'),
            endDate: (moment.isMoment(endDate)
                ? endDate
                : moment(endDate)
            ).format('yyyy-MM-DD'),
        });
    }

    int(s: string | number) {
        return typeof s === 'string' ? parseInt(s) : s;
    }
}
