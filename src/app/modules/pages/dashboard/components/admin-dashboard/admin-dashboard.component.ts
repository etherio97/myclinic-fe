import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DashboardService } from 'app/services/dashboard.service';
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
    dataLabels: { enabled: true, position: 'top' },
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
            offsetY: -20,
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
        const date = moment(this.formGroup.controls.daily.value);
        this.fetchData(date, date).subscribe((data: any) => {
            this.dailyData = data;
        });

        this.fetchData(
            date.subtract(1, 'day'),
            date.subtract(1, 'day'),
        ).subscribe((data: any) => {
            this.prevDailyData = data;
        });
    }

    reloadMonthlyData() {
        const date = moment(this.formGroup.controls.monthly.value);
        this.fetchData(date.startOf('month'), date.endOf('month')).subscribe(
            (data: any) => {
                this.monthlyData = data;
            },
        );

        this.fetchData(
            date.subtract(1, 'month').startOf('month'),
            date.subtract(1, 'month').endOf('month'),
        ).subscribe((data: any) => {
            this.prevMonthlyData = data;
        });
    }

    reloadPatientCountByDate() {
        const date = moment(this.formGroup.controls.monthly.value);

        this._dashboardService
            .getPatientCountByDate({
                startDate: date.startOf('month').format('yyyy-MM-DD'),
                endDate: date.endOf('month').format('yyyy-MM-DD'),
            })
            .subscribe((data: any) => {
                this.chartVisitors.series = [
                    {
                        name: 'Patients',
                        data: data.map((item: any) => ({
                            x: item.visit_date,
                            y: item.unique_patient_count,
                        })),
                    },
                ];
            });
    }

    private fetchData(startDate: any, endDate: any) {
        const condition: any = {};
        condition.startDate = moment.isMoment(startDate)
            ? startDate.format('yyyy-MM-DD')
            : moment(startDate).format('yyyy-MM-DD');
        condition.endDate = moment.isMoment(endDate)
            ? endDate.format('yyyy-MM-DD')
            : moment(endDate).format('yyyy-MM-DD');
        return this._dashboardService.getBatchAdmin(condition);
    }

    int(s: string | number) {
        return typeof s === 'string' ? parseInt(s) : s;
    }
}
