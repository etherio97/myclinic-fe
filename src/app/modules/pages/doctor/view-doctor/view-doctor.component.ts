import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { AppointmentService } from 'app/services/appointment.service';
import { DoctorService } from 'app/services/doctor.service';

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
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(({ id }) => {
            this.id = id;
            this.loadData();
        });
    }

    loadData() {
        this._doctorService.findById(this.id).subscribe((result) => {
            this.data = result;
        });

        this._appointmentService
            .getDoctorAppointments(this.id)
            .subscribe((result) => {
                console.log(result);
                this.appointments = result;
            });
    }

    handlePrint() {
        window.print();
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
