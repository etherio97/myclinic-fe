import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { APP_CONFIG, MESSAGES } from 'app/app.config';
import { UserService } from 'app/core/user/user.service';
import { ConfirmService } from 'app/services/confirm.service';
import { LabOrderService } from 'app/services/lab-order.service';
import moment from 'moment';

@Component({
    selector: 'app-lab-order-list',
    templateUrl: './lab-order-list.component.html',
})
export class LabOrderListComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'orderNo',
        'patient.fullName',
        'doctor.fullName',
        'referCentre',
        'status',
        'collectedDate',
        'actions',
    ];

    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    formGroup!: FormGroup;

    searchResult: any[] = [];

    categories: any = [];

    subgroups: any = [];

    labOrderStatus: any = APP_CONFIG.LAB_ORDER_STATUS;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    role!: string;

    constructor(
        private _fb: FormBuilder,
        private confirmService: ConfirmService,
        private _labOrderService: LabOrderService,
        private _userService: UserService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            startDate: moment().subtract(7, 'd'),
            endDate: moment(),
            status: '',
        });

        this._userService.get().subscribe(({ role }) => {
            this.role = role;
            this.initializeData();
        });
    }

    initializeData() {
        this.reloadData();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    reloadData() {
        const condition: any = {};
        if (moment.isMoment(this.formGroup.controls.startDate.value)) {
            condition.startDate =
                this.formGroup.controls.startDate.value.format('yyyy-MM-DD');
        } else {
            condition.startDate = moment(
                this.formGroup.controls.startDate.value,
            ).format('yyyy-MM-DD');
        }
        if (moment.isMoment(this.formGroup.controls.endDate.value)) {
            condition.endDate =
                this.formGroup.controls.endDate.value.format('yyyy-MM-DD');
        } else {
            condition.endDate = moment(
                this.formGroup.controls.endDate.value,
            ).format('yyyy-MM-DD');
        }
        if (this.formGroup.controls.status.value) {
            condition.status = this.formGroup.controls.status.value;
        }
        this._labOrderService.getAll(condition).subscribe((result: any) => {
            this.searchResult = this.dataSource.data = result;
        });
    }

    removeItem(id: string) {
        this.confirmService
            .confirm(MESSAGES.CONFIRM_DELETE_ITEM)
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmRemoveItem(id),
            );
    }

    confirmRemoveItem(id: string) {
        this._labOrderService.remove(id).subscribe(() => {
            this.confirmService
                .success(MESSAGES.SUCCESS_DELETE_ITEM)
                .afterOpened()
                .subscribe(() => this.reloadData());
        });
    }
}
