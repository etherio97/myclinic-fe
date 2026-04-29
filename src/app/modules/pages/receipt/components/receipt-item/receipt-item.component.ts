import { Component, Input, OnInit } from '@angular/core';

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

    @Input() type!: string;

    constructor() {}

    ngOnInit(): void {}

    get printDate() {
        return new Date();
    }

    get title() {
        switch (this.type) {
            case 'Laboratory':
                return 'ဓာတ်ခွဲခန်းနှင့်ရောဂါရှာဖွေရေးစင်တာ';
            default:
                return 'အထွေထွေရောဂါကုဆေးခန်း';
        }
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
