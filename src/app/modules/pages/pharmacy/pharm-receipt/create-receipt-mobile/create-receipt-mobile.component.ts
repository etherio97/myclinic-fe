import {
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_CONFIG, MESSAGES } from 'app/app.config';
import { PatientService } from 'app/services/patient.service';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { clone, cloneDeep, filter } from 'lodash';
import {
    MatAutocomplete,
    MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import moment from 'moment';
import { ConfirmService } from 'app/services/confirm.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CreatePatientModalComponent } from '../components/create-patient-modal/create-patient-modal.component';
import { PharmReceiptService } from 'app/services/pharm-receipt.service';
import { PharmItemService } from 'app/services/pharm-item.service';
import {
    NgxScannerQrcodeComponent,
    ScannerQRCodeConfig,
    ScannerQRCodeResult,
} from 'ngx-scanner-qrcode';

@Component({
    selector: 'app-create-receipt-mobile',
    templateUrl: './create-receipt-mobile.component.html',
})
export class CreateReceiptMobileComponent implements OnInit, OnDestroy {
    formGroup!: FormGroup;

    items: any[] = [];

    doctors: any[] = [];

    patients: any[] = [];

    paymentMethods = APP_CONFIG.PAYMENT_METHODS;

    patientFilteredOptions!: Observable<string[]>;

    doctorFilteredOptions!: Observable<string[]>;

    itemFilteredOptions!: Observable<string[]>;

    selectedItems: any[] = [];

    receiptNo = '';

    patientId = '';

    doctorId = '';

    cashier!: any;

    itemTypes = APP_CONFIG.ITEM_TYPES;

    inputAmount = 0;

    inputPrecentage = 0;

    private _selectedItem: any;

    private _modal!: MatDialogRef<any>;

    private _sub!: any;

    @ViewChild('qrCodeScannerRef') qrCodeScannerRef!: TemplateRef<any>;

    @ViewChild('inputItemRef') inputItemRef!: TemplateRef<any>;

    @ViewChild('action') scanner!: NgxScannerQrcodeComponent;

    constructor(
        private _receiptService: PharmReceiptService,
        private _patientService: PatientService,
        private _itemService: PharmItemService,
        private _fb: FormBuilder,
        private _confirmService: ConfirmService,
        private _router: Router,
        private route: ActivatedRoute,
        private _dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            patient: [''],
            date: [''],
            paymentMethod: ['Cash', Validators.required],
            discountAmount: [''],
            discountPercent: [''],
            item: [''],
        });

        this.formGroup.controls.discountPercent.valueChanges.subscribe(
            (value) => {
                let subTotal = this.getSubTotal();
                let discountAmount = subTotal * (value / 100);
                this.formGroup.controls.discountAmount.setValue(discountAmount);
            },
        );

        this.route.params.subscribe(({ patientId }) => {
            if (!patientId) return;

            this.patientId = patientId;
            this._patientService.findById(patientId).subscribe((result) => {
                this.formGroup.controls.patient.setValue(result);
            });
        });

        this._itemService.getAll({}).subscribe((res: any) => {
            this.items = res;
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

        this.itemFilteredOptions =
            this.formGroup.controls.item.valueChanges.pipe(
                startWith(''),
                map((value) => this._filterItem(value || '')),
            );
    }

    ngOnDestroy(): void {
        this._sub?.unsubscribe();
        if (this.scanner && this.scanner.isStart) {
            this.scanner.stop();
        }
    }

    reloadPatients() {
        this._patientService.getAll({}).subscribe((res: any) => {
            this.patients = res;
        });
    }

    displayPatientFn(patient: any): string {
        return patient ? `${patient.fullName} #${patient.patientNo}` : '';
    }

    displayItemFn(item: any): string {
        return item && item.name ? item.name : '';
    }

    private _filterItem(value: any): any[] {
        const filterValue =
            typeof value === 'string' ? value.toLowerCase() : '';
        return this.items.filter((option) => {
            return (
                option.code.toLowerCase() == filterValue ||
                option.barcode == filterValue ||
                option.name.toLowerCase().includes(filterValue) ||
                option.code.toLowerCase().includes(filterValue)
            );
        });
    }

    private _isKeyDown = false;

    onKeyDown() {
        this._isKeyDown = true;
    }

    selectFirstItemOnEnter(event: Event, autocomplete: MatAutocomplete): void {
        event.preventDefault(); // Prevent form submission

        if (this._isKeyDown) return;

        let value = (<any>event.target).value;
        if (value) {
            let item = this.items.find(
                (item) => item.code.toLowerCase() == value.toLowerCase(),
            );
            if (item) {
                this.onItemSelect(<any>{ option: { value: item } });
                return;
            }
        }

        const options = autocomplete.options.toArray();
        if (options.length > 0) {
            const firstOption = options[0];
            autocomplete.optionSelected.emit({
                source: autocomplete,
                option: firstOption,
            } as MatAutocompleteSelectedEvent);
            // autocomplete.closed;
        }
    }

    onItemSelect(event: MatAutocompleteSelectedEvent): void {
        const selectedItem = cloneDeep(event.option.value);

        if (!selectedItem) return;

        selectedItem.unit = selectedItem.unit || selectedItem.defaultUnit;
        selectedItem.quantity = selectedItem.quantity || 1;
        this.selectedItems.push(selectedItem);
        this.onChangeUnit(selectedItem, selectedItem.unit);

        setTimeout(() => {
            this.formGroup.get('item')?.markAsUntouched();
            this.formGroup.get('item')?.setValue('');
            this._isKeyDown = false;
        });
    }

    onChangeUnit(item: any, unit: any) {
        if (item.units.length === 1) {
            item.sellingPrice = item.unitPrice;
            this.recalculateDiscount();
            return;
        }
        if (typeof unit === 'object') {
            unit = unit.value;
        }
        if (item.units[0] === unit) {
            item.sellingPrice = item.unitPrice;
        } else {
            item.sellingPrice = item.eachPrice;
        }
        this.recalculateDiscount();
    }

    recalculateDiscount() {
        if (this.formGroup.controls.discountPercent.value) {
            let subTotal = this.getSubTotal();
            let discountAmount =
                subTotal *
                (this.formGroup.controls.discountPercent.value / 100);
            this.formGroup.controls.discountAmount.setValue(discountAmount);
        }
    }

    removeItem(code: string): void {
        const index = this.selectedItems.findIndex(
            (item) => item.code === code,
        );
        if (index === -1) return;
        this.selectedItems.splice(index, 1);
        this.recalculateDiscount();
    }

    handlePrint() {
        if (!this.formGroup.valid) {
            return this._confirmService.open({
                title: 'Invalid',
                message: MESSAGES.REQUIRED_ALL_FIELDS,
                actions: {
                    cancel: { label: 'OK' },
                    confirm: { show: false },
                },
                dismissible: true,
            });
        }
        window.print();
    }

    private _filterPatient(value: string): string[] {
        const filterValue = typeof value == 'string' ? value.toLowerCase() : '';

        return this.patients.filter((option) =>
            option.fullName.toLowerCase().includes(filterValue),
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

    submit() {
        if (!this.formGroup.valid) {
            return this._confirmService.error(
                MESSAGES.REQUIRED_ALL_FIELDS,
                'Invalid',
            );
        }
        if (!this.selectedItems.length) {
            return this._confirmService.error(
                MESSAGES.PLEASE_INPUT_ITEMS,
                'Invalid',
            );
        }
        if (
            this.formGroup.value.patient &&
            typeof this.formGroup.value.patient !== 'object'
        ) {
            return this._confirmService.error(
                MESSAGES.PLEASE_SELECT_PATIENT,
                'Invalid',
            );
        }
        if (
            this.formGroup.value.doctor &&
            typeof this.formGroup.value.doctor !== 'object'
        ) {
            return this._confirmService.error(
                MESSAGES.PLEASE_SELECT_DOCTOR,
                'Invalid',
            );
        }
        this._confirmService
            .confirm(MESSAGES.CONFIRM_CREATE_RECEIPT)
            .beforeClosed()
            .subscribe(
                (value) => value === 'confirmed' && this.confirmSubmit(),
            );
    }

    confirmSubmit() {
        const data = clone(this.formGroup.value);

        data.patient = data.patient?.id;

        data.items = this.selectedItems;

        data.subtotal = this.getSubTotal();

        data.grandTotal = this.getGrandTotal();

        data.discountAmount = this.getDiscount();

        if (data.date) {
            data.date = moment(data.date).toISOString();
        } else {
            data.date = moment().toISOString();
        }

        delete data.item;
        delete data.discountPercent;

        this._receiptService.create(data).subscribe((response: any) => {
            this.receiptNo = response.receiptNo;
            this.cashier = response.user;
            setTimeout(() => {
                this._router.navigate(
                    ['/pharmacy', 'receipts', 'view', response.id],
                    {
                        // now disabled because of POS printer is not setup yet, will enable this in the future
                        // queryParams: { print: 'true' },
                    },
                );
            });
        });
    }

    getSubTotal() {
        let i = 0;

        this.selectedItems.forEach((item) => {
            i += item.sellingPrice * item.quantity;
        });

        return i;
    }

    getGrandTotal() {
        return this.getSubTotal() - this.getDiscount();
    }

    getDiscount() {
        let i = 0;

        if (this.formGroup.controls.discountAmount.value) {
            i += this.formGroup.controls.discountAmount.value;
        }

        this.selectedItems.forEach((item) => {
            if (item.discount) {
                i += item.discount;
            }
        });

        return i;
    }

    get selectedItemsReverse() {
        // return this.selectedItems ? [...this.selectedItems] : [];
        return this.selectedItems;
    }

    isObject(obj: any) {
        return typeof obj === 'object';
    }

    private _isScanned = false;

    scannedItem: any;

    config: ScannerQRCodeConfig = {
        constraints: {
            video: {
                facingMode: 'environment', // 'environment' targets the main/back camera
                width: { ideal: 280 },
                height: { ideal: 280 },
            },
        },
    };

    devices: any[] = [];

    selectedDevice!: any;

    // Define a key for localStorage
    private readonly CAMERA_STORAGE_KEY = 'preferred_camera_device';

    openScanner() {
        this._isScanned = false;
        this.scannedItem = null;

        this._modal = this._dialog.open(this.qrCodeScannerRef, {
            height: '380px',
            width: '280px',
        });

        this._sub = this._modal.afterOpened().subscribe(() => {
            if (this.scanner) {
                // Subscribe to devices observable to ensure devices are fully loaded (crucial for iOS)
                this.scanner.devices.subscribe((devices: any[]) => {
                    if (!devices || devices.length === 0) return;

                    this.devices = devices;

                    // 1. Retrieve saved device ID from localStorage
                    const savedDeviceId = localStorage.getItem(
                        this.CAMERA_STORAGE_KEY,
                    );

                    // 2. Find matching device by deviceId or label
                    let targetDevice = devices.find(
                        (d) => d.deviceId === savedDeviceId,
                    );

                    // 3. Fallback: If no saved device, target the back/environment camera on iOS
                    if (!targetDevice) {
                        targetDevice = devices.find((d) =>
                            /back|rear|environment/i.test(d.label),
                        );
                    }

                    if (targetDevice) {
                        this.selectedDevice = targetDevice;
                        // Play the target device directly
                        this.scanner.playDevice(targetDevice.deviceId);
                    } else {
                        // Fallback to default start if no specific device is matched
                        this.scanner.start();
                        this.selectedDevice =
                            this.devices[this.scanner.deviceIndexActive];
                    }
                });
            }
        });

        // Turn off camera feed when the dialog closes
        this._modal.afterClosed().subscribe(() => {
            if (this.scanner && this.scanner.isStart) {
                this.scanner.stop();
            }
        });
    }

    onChangeDevice(event: any) {
        if (this.scanner && this.scanner.isStart && event) {
            this.selectedDevice = event;

            // Save the chosen device ID to localStorage
            if (this.selectedDevice.deviceId) {
                localStorage.setItem(
                    this.CAMERA_STORAGE_KEY,
                    this.selectedDevice.deviceId,
                );
            }

            this.scanner.playDevice(this.selectedDevice.deviceId);
        }
    }

    onScan(results: ScannerQRCodeResult[]) {
        if (this._isScanned) return;
        this._isScanned = true;
        this._modal.close();
        if (results && results.length > 0) {
            let value = results[0].value;
            let item = this.items.find(
                (item) => item.code.toLowerCase() === value.toLowerCase(),
            );
            if (!item) {
                return alert('Item not found!');
            }
            this.scannedItem = cloneDeep(item);
            this.scannedItem.unit = this.scannedItem.defaultUnit;
            this.scannedItem.quantity = '1';
            this._modal = this._dialog.open(this.inputItemRef, {
                width: '320px',
            });
        }
    }

    onConfirmScanned() {
        this._modal.close();
        let item = this.scannedItem;
        item.quantity = parseInt(item.quantity);
        this.onItemSelect(<any>{
            option: {
                value: item,
            },
        });
    }

    closeModal() {
        this._modal.close();
    }
}
