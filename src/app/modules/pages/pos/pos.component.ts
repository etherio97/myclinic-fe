import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_CONFIG, MESSAGES, MY_DATE_FORMATS } from 'app/app.config';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { DoctorService } from 'app/services/doctor.service';
import { ReceiptService } from 'app/services/receipt.service';
import { PatientService } from 'app/services/patient.service';
import { ItemService } from 'app/services/item.service';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { clone } from 'lodash';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import moment from 'moment';
import { ConfirmService } from 'app/services/confirm.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'app/core/user/user.service';
import { CreatePatientModalComponent } from '../receipt/components/create-patient-modal/create-patient-modal.component';
import { PharmItemService } from 'app/services/pharm-item.service';

@Component({
    selector: 'app-pos',
    templateUrl: './pos.component.html',
})
export class POSComponent implements OnInit {
    formGroup!: FormGroup;

    items: any[] = [];

    pharmItems: any[] = [];

    doctors: any[] = [];

    patients: any[] = [];

    paymentMethods = APP_CONFIG.PAYMENT_METHODS;

    patientFilteredOptions!: Observable<string[]>;

    doctorFilteredOptions!: Observable<string[]>;

    patientId = '';

    doctorId = '';

    cashier!: any;

    itemTypes = APP_CONFIG.ITEM_TYPES;

    inputAmount = 0;

    inputPrecentage = 0;

    user!: any;

    responseClinic!: any;
    responseLab!: any;
    responsePharmacy!: any;

    private _modal!: MatDialogRef<CreatePatientModalComponent>;

    @ViewChild('finalPopup') finalPopupRef!: TemplateRef<any>;

    constructor(
        private _doctorService: DoctorService,
        private _patientService: PatientService,
        private _itemService: ItemService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private route: ActivatedRoute,
        private _dialog: MatDialog,
        private _userService: UserService,
        private _pharmItemService: PharmItemService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            patient: [''],
            doctor: [''],
            date: [''],
        });

        this._userService.user$.subscribe((user) => {
            this.cashier = user;
        });

        this.route.params.subscribe(({ patientId }) => {
            if (!patientId) return;

            this.patientId = patientId;
            this._patientService.findById(patientId).subscribe((result) => {
                this.formGroup.controls.patient.setValue(result);
            });

            this.route.queryParamMap.subscribe((params) => {
                if (!params.has('doctorId')) return;
                this.doctorId = <string>params.get('doctorId');
                if (!this.doctorId) return;
                this._doctorService
                    .findById(this.doctorId)
                    .subscribe((result) => {
                        this.formGroup.controls.doctor.setValue(result);
                    });
            });
        });

        this._itemService.getAll({}).subscribe((res: any) => {
            this.items = res;
        });

        this._pharmItemService.getAll({}).subscribe((res: any) => {
            this.pharmItems = res;
        });

        this._doctorService.getAll({}).subscribe((res: any) => {
            this.doctors = res;
        });

        this.reloadPatients();

        this.patientFilteredOptions =
            this.formGroup.controls.patient.valueChanges.pipe(
                startWith(''),
                map((value) => {
                    const filterText =
                        typeof value === 'object' && value
                            ? value.fullName
                            : value;
                    return this._filterPatient(filterText || '');
                }),
            );

        this.doctorFilteredOptions =
            this.formGroup.controls.doctor.valueChanges.pipe(
                startWith(''),
                map((value) => {
                    const filterText =
                        typeof value === 'object' && value
                            ? value.fullName
                            : value;
                    return this._filterDoctor(filterText || '');
                }),
            );
    }

    reloadPatients() {
        this._patientService.getAll({}).subscribe((res: any) => {
            this.patients = res;
        });
    }

    displayPatientFn(patient: any): string {
        return patient ? `${patient.fullName} #${patient.patientNo}` : '';
    }

    displayDoctorFn(doctor: any): string {
        return doctor ? `${doctor.fullName} (${doctor.specialization})` : '';
    }

    private _filterPatient(value: string): string[] {
        const filterValue = typeof value == 'string' ? value.toLowerCase() : '';

        return this.patients.filter(
            (option) =>
                option.fullName.toLowerCase().includes(filterValue) ||
                option.patientNo.toString().includes(filterValue),
        );
    }

    private _filterDoctor(value: string): string[] {
        const filterValue = typeof value == 'string' ? value.toLowerCase() : '';

        return this.doctors.filter(
            (option) =>
                option.fullName.toLowerCase().includes(filterValue) ||
                option.specialization.toLowerCase().includes(filterValue),
        );
    }

    openCreatePatientModal() {
        this._modal = this._dialog.open(CreatePatientModalComponent, {
            maxWidth: '80vw',
            width: '100%',
            maxHeight: '90vh',
            disableClose: true,
        });

        this._modal.componentInstance.closeModal = () => this._modal.close();

        this._modal.componentInstance.onCreatedPatient = (patient: any) => {
            this.formGroup.controls.patient.setValue(patient);
            this.reloadPatients();
            this._modal.close();
        };
    }

    isObject(obj: any) {
        return typeof obj === 'object';
    }

    onSubmittedClinic(event: any) {
        if (event.type === 'Clinic') {
            this.responseClinic = event.response;
        } else {
            this.responseLab = event.response;
        }
    }

    onSubmittedPharmacy(event: any) {
        this.responsePharmacy = event.response;
    }

    isPrintingClinic = false;

    response!: any;

    printClinicReceipt() {
        this.isPrintingClinic = true;
        this.isPrintingPharmacy = false;
        this.response = this.responseClinic;
        setTimeout(() => window.print(), 400);
    }

    printLabReceipt() {
        this.isPrintingClinic = true;
        this.isPrintingPharmacy = false;
        this.response = this.responseLab;
        setTimeout(() => window.print(), 400);
    }

    isPrintingPharmacy = false;

    printPharmacyReceipt() {
        this.isPrintingPharmacy = true;
        this.isPrintingClinic = false;
        this.response = this.responsePharmacy;
        setTimeout(() => window.print(), 400);
    }

    printAll() {
        this.responseClinic && this.printClinicReceipt();
        this.responsePharmacy && this.printPharmacyReceipt();
        this.responseLab && this.printLabReceipt();
        if (this.responseClinic || this.responsePharmacy || this.responseLab)
            this.reset();
    }

    isReseting = false;

    reset() {
        this._modal = this._dialog.open(this.finalPopupRef, {
            width: '360px',
        });
    }

    closeModal() {
        this._modal.close();
    }

    confirmReset() {
        this._modal.close();
        this.formGroup.reset();
        this.responseClinic = null;
        this.responseLab = null;
        this.responsePharmacy = null;
        this.response = null;
        this.isReseting = true;
        setTimeout(() => {
            this.isReseting = false;
        }, 200);
    }

    int(s: string | number) {
        return typeof s === 'string' ? parseInt(s) : s;
    }
}
