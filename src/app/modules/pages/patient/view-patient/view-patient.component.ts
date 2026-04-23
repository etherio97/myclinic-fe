import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { ReceiptService } from 'app/services/receipt.service';
import { PatientService } from 'app/services/patient.service';
import { AppointmentService } from 'app/services/appointment.service';

@Component({
    selector: 'app-view-patient',
    templateUrl: './view-patient.component.html',
    providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class ViewPatientComponent implements OnInit {
    id!: string;

    data!: any;

    receipts!: any;

    appointments!: any;

    constructor(
        private _receiptService: ReceiptService,
        private _appointmentService: AppointmentService,
        private _patientService: PatientService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(({ id }) => {
            this.id = id;
            this.loadData();
        });
    }

    loadData() {
        this._patientService.findById(this.id).subscribe((result) => {
            this.data = result;
        });

        this._appointmentService
            .getPatientAppointments(this.id)
            .subscribe((result) => {
                this.appointments = result;
            });

        this._receiptService.getPatientReceipt(this.id).subscribe((result) => {
            this.receipts = result;
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
