import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { AppointmentService } from 'app/services/appointment.service';
import { DoctorService } from 'app/services/doctor.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'app-view-doctor',
    templateUrl: './view-doctor.component.html',
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class ViewDoctorComponent implements OnInit {
    id!: string;

    data!: any;

    appointments!: any;

    constructor(
        private _appointmentService: AppointmentService,
        private _doctorService: DoctorService,
        private _confirmService: FuseConfirmationService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(({ id }) => {
            this.id = id;
            this.loadData();
        });
    }

    loadData() {
        this.loadDoctorDetails();
        this.loadAppointments();
    }

    private loadDoctorDetails() {
        this._doctorService.findById(this.id).subscribe((result) => {
            this.data = result;
        });
    }

    private loadAppointments() {
        this._appointmentService
            .getDoctorAppointments(this.id)
            .subscribe((result) => {
                this.appointments = result;
            });
    }

    changeStatus() {
        let message = '';
        if (this.data.isActive) {
            message = 'Are you sure do you want to inactive this doctor?';
        } else {
            message = 'Are you sure do you want to active this doctor?';
        }
        this._confirmService
            .open({
                title: 'Confirmation',
                message,
                dismissible: true,
            })
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmChangeStatus(),
            );
    }

    private confirmChangeStatus() {
        let isActive = !this.data.isActive;
        this._doctorService.update(this.id, { isActive }).subscribe((data) => {
            setTimeout(() => this.loadDoctorDetails());
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
