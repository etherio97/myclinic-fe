import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { ReceiptService } from 'app/services/receipt.service';
import { PatientService } from 'app/services/patient.service';
import { AppointmentService } from 'app/services/appointment.service';
import { PharmReceiptService } from 'app/services/pharm-receipt.service';
import { UserService } from 'app/core/user/user.service';
import { LabResultService } from 'app/services/lab-result.service';

@Component({
    selector: 'app-view-patient',
    templateUrl: './view-patient.component.html',
})
export class ViewPatientComponent implements OnInit {
    id!: string;

    data!: any;

    receipts!: any;

    pharmReceipts!: any;

    labResults!: any;

    appointments!: any;

    role!: string;

    constructor(
        private _receiptService: ReceiptService,
        private _appointmentService: AppointmentService,
        private _patientService: PatientService,
        private _pharmReceiptService: PharmReceiptService,
        private _labResultService: LabResultService,
        private _userService: UserService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this._userService.get().subscribe((user) => {
            this.role = user.role;
            this.route.params.subscribe(({ id }) => {
                this.id = id;
                this.loadData();
            });
        });
    }

    loadData() {
        this._patientService.findById(this.id).subscribe((result) => {
            this.data = result;
        });

        ['admin', 'manager', 'cashier'].includes(this.role) &&
            this._appointmentService
                .getPatientAppointments(this.id)
                .subscribe((result) => {
                    this.appointments = result;
                });

        ['admin', 'manager', 'cashier', 'lab-admin'].includes(this.role) &&
            this._receiptService
                .getPatientReceipt(this.id)
                .subscribe((result) => {
                    this.receipts = result;
                });

        ['admin', 'manager', 'cashier', 'pharm-cashier'].includes(this.role) &&
            this._pharmReceiptService
                .getPatientReceipt(this.id)
                .subscribe((result) => {
                    this.pharmReceipts = result;
                });

        ['admin', 'manager', 'lab-admin', 'lab-cashier'].includes(this.role) &&
            this._labResultService
                .getPatientResults(this.id)
                .subscribe((result) => {
                    this.labResults = result;
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

    showItem(items: any[]) {
        let data = items.map(
            (item) => item.code + ' * ' + item.quantity + item.unit,
        );
        let l = data.length;
        if (l > 5) {
            let n = l - 5;
            return (
                '<li>' +
                data.slice(0, 5).join('</li><li>') +
                '</li><p class="text-teal-600 text-xs">+' +
                n +
                ' more items</p>'
            );
        }
        return '<li>' + data.join('</li><li>') + '</li>';
    }
}
