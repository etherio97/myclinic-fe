import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APP_CONFIG, MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { ReceiptService } from 'app/services/receipt.service';
import { PatientService } from 'app/services/patient.service';
import { AppointmentService } from 'app/services/appointment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'app-view-appointment',
    templateUrl: './view-appointment.component.html',
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class ViewAppointmentComponent implements OnInit {
    id!: string;

    data!: any;

    appointmentStatus = APP_CONFIG.APPOINTMENT_STATUS;
    formGroup!: FormGroup;

    @ViewChild('changeStatusModalRef')
    changeStatusModalRef!: TemplateRef<any>;

    _modal!: MatDialogRef<HTMLElement>;

    constructor(
        private _fb: FormBuilder,
        private _appointmentService: AppointmentService,
        private _confirmService: FuseConfirmationService,
        private dialog: MatDialog,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({ status: ['', Validators.required] });

        this.route.params.subscribe(({ id }) => {
            this.id = id;
            this.loadData();
        });
    }

    loadData() {
        this._appointmentService.findById(this.id).subscribe((result) => {
            this.data = result;

            this.formGroup.controls.status.setValue(this.data.status);
        });
    }

    openChangeStatusModal() {
        this._modal = this.dialog.open(this.changeStatusModalRef, {
            minWidth: '320px',
        });
    }

    submit() {
        if (!this.formGroup.valid) return;

        this._appointmentService
            .update(this.id, { status: this.formGroup.value.status })
            .subscribe(() => {
                this._modal.close();
                this.loadData();
            });
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
}
