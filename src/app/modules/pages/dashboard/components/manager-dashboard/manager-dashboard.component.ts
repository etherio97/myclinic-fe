import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DashboardService } from 'app/services/dashboard.service';
import { cloneDeep } from 'lodash-es';
import moment from 'moment';

const CHART_VISITORS_DAILY = {
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
        padding: {
            left: 30,
            right: 30,
        },
    },
    series: [],
    tooltip: {
        followCursor: true,
        theme: 'dark',
        x: {
            format: 'HH:mm:ss',
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
        // type: 'time',
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

const CHART_REVENUE_DAILY = {
    chart: {
        width: '100%',
        height: '100%',
        type: 'area',
        toolbar: { show: false },
        zoom: { enabled: false },
    },
    colors: ['#35bbbd'],
    dataLabels: {
        enabled: true,
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
        padding: {
            left: 30,
            right: 30,
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
        // type: 'datetime',
    },
    yaxis: {
        labels: {
            offsetY: -20,
            style: {
                colors: '#CBD5E1',
            },
        },
        show: false,
    },
};

@Component({
    selector: 'app-manager-dashboard',
    templateUrl: './manager-dashboard.component.html',
})
export class ManagerDashboardComponent implements OnInit {
    formGroup!: FormGroup;

    dailyData: any = {};

    prevDailyData: any = {};

    chartVisitorsDaily: any = CHART_VISITORS_DAILY;

    chartRevenueDaily: any = CHART_REVENUE_DAILY;

    constructor(
        private _fb: FormBuilder,
        private _dashboardService: DashboardService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            daily: [moment()],
        });

        this.formGroup.controls.daily.valueChanges.subscribe(() => {
            this.reloadDailyData();
            this.reloadDailyStatistics();
        });

        this.reloadDailyData();
        this.reloadDailyStatistics();
    }

    reloadDailyData() {
        this.fetchData(
            this.formGroup.controls.daily.value,
            this.formGroup.controls.daily.value,
        ).subscribe((data: any) => {
            this.dailyData = data;
        });

        this.fetchData(
            moment(this.formGroup.controls.daily.value).subtract(1, 'day'),
            moment(this.formGroup.controls.daily.value).subtract(1, 'day'),
        ).subscribe((data: any) => {
            this.prevDailyData = data;
        });
    }

    reloadDailyStatistics() {
        const value = cloneDeep(this.formGroup.controls.daily.value);
        const date = moment.isMoment(value) ? value : moment(value);
        this._dashboardService
            .getDailyStatistics({
                startDate: cloneDeep(date).format('yyyy-MM-DD'),
                endDate: cloneDeep(date).format('yyyy-MM-DD'),
            })
            .subscribe((data: any) => {
                this.chartVisitorsDaily.series = [
                    {
                        name: 'Patients',
                        data: data.patientCount.map((item: any) => ({
                            x: moment(item.label).format('HH:mm:ss'),
                            y: item.value,
                        })),
                    },
                ];

                this.chartRevenueDaily.series = [
                    {
                        name: 'Revenue',
                        data: data.revenueTrend.map((item: any) => ({
                            x: moment(item.label).format('HH:mm:ss'),
                            y: item.value,
                        })),
                    },
                ];
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
