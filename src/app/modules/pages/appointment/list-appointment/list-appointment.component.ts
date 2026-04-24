import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { APP_CONFIG } from 'app/app.config';
import { UserService } from 'app/core/user/user.service';
import { AppointmentService } from 'app/services/appointment.service';
import moment from 'moment';

@Component({
    selector: 'app-list-appointment',
    templateUrl: './list-appointment.component.html',
})
export class ListAppointmentComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        // 'appointmentNo',
        'appointmentDate',
        'patientName',
        'status',
        'phoneNumber',
        // 'appointmentType',
        'appointmentCase',
        'doctorName',
        'referDoctorName',
        'actions',
    ];

    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    formGroup!: FormGroup;

    searchResult: any[] = [];

    role!: string;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    appointmentStatus = APP_CONFIG.APPOINTMENT_STATUS;

    constructor(
        private _fb: FormBuilder,
        private confirmService: FuseConfirmationService,
        private _appointmentService: AppointmentService,
        private _userService: UserService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            startDate: [moment()],
            endDate: [moment()],
            status: [''],
        });

        this._userService.get().subscribe((user) => {
            this.role = user.role;
        });

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
        this._appointmentService.getAll(condition).subscribe((data: any) => {
            this.searchResult = this.dataSource.data = data;
        });
    }

    removeAppointment(id: string) {
        this.confirmService
            .open({
                title: 'Confirmation',
                message: 'Are you sure to delete?',
                icon: { color: 'primary' },
                actions: { confirm: { color: 'primary' } },
                dismissible: true,
            })
            .beforeClosed()
            .subscribe(
                (value) =>
                    value === 'confirmed' && this.confirmRemoveAppointment(id),
            );
    }

    confirmRemoveAppointment(id: string) {
        this._appointmentService.remove(id).subscribe(() => {
            this.confirmService
                .open({
                    title: 'Success',
                    message: 'Appointment has been successfully deleted',
                    icon: { color: 'success', name: '' },
                    actions: {
                        confirm: { show: false },
                        cancel: { label: 'OK' },
                    },
                })
                .afterOpened()
                .subscribe(() => this.reloadData());
        });
    }
}
