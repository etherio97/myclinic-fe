import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from 'app/core/user/user.service';
import { DashboardService } from 'app/services/dashboard.service';
import { cloneDeep, initial } from 'lodash';
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

const CHART_REVENUE = {
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
        type: 'datetime',
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

    chartRevenue: any = CHART_REVENUE;

    chartVisitorsDaily: any = CHART_VISITORS_DAILY;

    chartRevenueDaily: any = CHART_REVENUE_DAILY;

    role!: string;

    constructor(
        private _fb: FormBuilder,
        private _dashboardService: DashboardService,
        private _userService: UserService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            monthly: [moment()],
            daily: [moment()],
        });

        this._userService.get().subscribe((user: any) => {
            this.role = user.role;
            this.initializeData();
        });
    }

    initializeData() {
        this.formGroup.controls.monthly.valueChanges.subscribe(() => {
            this.reloadMonthlyData();
            this.reloadMonthlyStatistics();
        });

        this.formGroup.controls.daily.valueChanges.subscribe(() => {
            this.reloadDailyData();
            this.reloadDailyStatistics();
        });

        this.reloadDailyData();
        this.reloadDailyStatistics();
        this.reloadMonthlyData();
        this.reloadMonthlyStatistics();
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

    reloadMonthlyStatistics() {
        const value = cloneDeep(this.formGroup.controls.monthly.value);
        const date = moment.isMoment(value) ? value : moment(value);

        let params: any = {
            startDate: cloneDeep(date).startOf('month').format('yyyy-MM-DD'),
            endDate: cloneDeep(date).endOf('month').format('yyyy-MM-DD'),
        };

        if (this.role === 'lab-admin') {
            params.type = 'laboratory';
        }

        this._dashboardService
            .getMonthlyStatistics(params)
            .subscribe((data: any) => {
                this.chartVisitors.series = [
                    {
                        name: 'Patients',
                        data: data.patientCount.map((item: any) => ({
                            x: moment(item.label).format('yyyy-MM-DD'),
                            y: item.value,
                        })),
                    },
                ];

                this.chartRevenue.series = [
                    {
                        name: 'Revenue',
                        data: data.revenueTrend.map((item: any) => ({
                            x: moment(item.label).format('yyyy-MM-DD'),
                            y: item.value,
                        })),
                    },
                ];
            });
    }

    reloadDailyStatistics() {
        const value = cloneDeep(this.formGroup.controls.daily.value);
        const date = moment.isMoment(value) ? value : moment(value);

        let params: any = {
            startDate: cloneDeep(date).format('yyyy-MM-DD'),
            endDate: cloneDeep(date).format('yyyy-MM-DD'),
        };

        if (this.role === 'lab-admin') {
            params.type = 'laboratory';
        }

        this._dashboardService
            .getDailyStatistics(params)
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
        let params: any = {
            startDate: (moment.isMoment(startDate)
                ? startDate
                : moment(startDate)
            ).format('yyyy-MM-DD'),
            endDate: (moment.isMoment(endDate)
                ? endDate
                : moment(endDate)
            ).format('yyyy-MM-DD'),
        };
        if (this.role === 'lab-admin') {
            params.type = 'laboratory';
        }
        return this._dashboardService.getBatchAdmin(params);
    }

    int(s: string | number) {
        return typeof s === 'string' ? parseInt(s) : s;
    }
}
