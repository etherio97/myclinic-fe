import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-receipt-item',
    templateUrl: './receipt-item.component.html',
    styleUrls: ['./receipt-item.component.scss'],
})
export class ReceiptItemComponent implements OnInit {
    @Input() items: any;

    @Input() date!: string;

    @Input() receiptNo!: string;

    @Input() discount!: number;

    @Input() subTotal!: number;

    @Input() grandTotal!: number;

    @Input() patient: any;

    @Input() paymentMethod: any;

    @Input() doctor: any;

    @Input() cashier: any;

    constructor() {}

    ngOnInit(): void {}

    get printDate() {
        return new Date();
    }
}
