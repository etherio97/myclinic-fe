import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-inventory-print',
    templateUrl: './inventory-print.component.html',
    styleUrls: ['./inventory-print.component.scss'],
})
export class InventoryPrintComponent implements OnInit {
    @Input() items: any;

    constructor() {}

    ngOnInit(): void {}

    get printDate() {
        return new Date();
    }
}
