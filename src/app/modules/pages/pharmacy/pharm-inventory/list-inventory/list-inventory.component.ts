import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MESSAGES } from 'app/app.config';
import { UserService } from 'app/core/user/user.service';
import { PharmInventoryService } from 'app/services/pharm-inventory.service';
import { PharmItemService } from 'app/services/pharm-item.service';

@Component({
    selector: 'app-list-inventory',
    templateUrl: './list-inventory.component.html',
})
export class ListInventoryComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'code',
        'name',
        'totalPurchased',
        'totalSold',
        'status',
        'currentStock',
    ];

    displayedColumnsForExtra: string[] = [
        'code',
        'name',
        'totalPurchased',
        'totalSold',
        'currentStock',
        'minThreshold',
    ];

    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    formGroup!: FormGroup;

    searchResult: any[] = [];

    lowStockItems: MatTableDataSource<any> = new MatTableDataSource<any>();

    outOfStockItems: MatTableDataSource<any> = new MatTableDataSource<any>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    role!: string;

    trackingUnits: string[] = [];

    constructor(
        private _fb: FormBuilder,
        private _inventoryService: PharmInventoryService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            showAll: '0',
            searchValue: '',
            trackingUnit: [],
            sortBy: 'name:asc',
        });

        this.formGroup.controls.sortBy.valueChanges.subscribe((value) =>
            setTimeout(() => this.filterData()),
        );

        this.formGroup.controls.trackingUnit.valueChanges.subscribe((value) =>
            setTimeout(() => this.filterData()),
        );

        this.formGroup.controls.searchValue.valueChanges.subscribe((value) =>
            setTimeout(() => this.filterData()),
        );

        this.reloadData();
    }

    filterData() {
        let isFiltered = false;
        let searchValue = this.formGroup.value.searchValue;
        let data: any = this.searchResult;
        if (searchValue) {
            isFiltered = true;
            let filterValue = searchValue.toLowerCase();
            data = data.filter(
                (option: any) =>
                    option.itemName.toLowerCase().includes(filterValue) ||
                    option.itemCode.toLowerCase().includes(filterValue),
            );
        }
        let trackingUnit = this.formGroup.value.trackingUnit;
        if (trackingUnit?.length) {
            isFiltered = true;
            data = data.filter((option: any) =>
                trackingUnit.includes(option.unit),
            );
        }
        if (!isFiltered) {
            data = this.searchResult;
        }
        this.dataSource.data = data;
        this.sortData();
    }

    sortData() {
        const sortBy = this.formGroup.value.sortBy;
        switch (sortBy) {
            case 'name:asc':
                this.dataSource.data = this.dataSource.data.sort((a, b) =>
                    a.itemName.localeCompare(b.itemName),
                );
                break;
            case 'stock:asc':
                this.dataSource.data = this.dataSource.data.sort(
                    (a, b) => a.currentStock - b.currentStock,
                );
                break;
            case 'stock:desc':
                this.dataSource.data = this.dataSource.data.sort(
                    (a, b) => b.currentStock - a.currentStock,
                );
                break;
            case 'sale:asc':
                this.dataSource.data = this.dataSource.data.sort(
                    (a, b) => a.totalSold - b.totalSold,
                );
                break;
            case 'sale:desc':
                this.dataSource.data = this.dataSource.data.sort(
                    (a, b) => b.totalSold - a.totalSold,
                );
                break;
        }
    }

    getStatus(element: any) {
        if (element.currentStock <= 0) {
            return 'Out of Stock';
        }
        if (element.currentStock <= element.minThreshold) {
            return 'Low Stock';
        }
        return 'OK';
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    reloadData() {
        this._inventoryService
            .getAll({ showAll: this.formGroup.value.showAll })
            .subscribe((result: any) => {
                this.searchResult = this.dataSource.data = result.map(
                    (item: any) => {
                        item.status = this.getStatus(item);
                        return item;
                    },
                );

                this.lowStockItems.data = this.searchResult.filter(
                    (item) => item.status === 'Low Stock',
                );

                this.outOfStockItems.data = this.searchResult.filter(
                    (item) => item.status === 'Out of Stock',
                );

                let trackingUnits: string[] = [];

                this.searchResult.forEach((item) => {
                    trackingUnits.includes(item.unit) ||
                        trackingUnits.push(item.unit);
                });

                this.trackingUnits = trackingUnits;

                this.filterData();
            });
    }

    calculateStock(
        quantity: string,
        unit: string,
        units: string[],
        quantityPerUnit: string,
    ) {
        // let qty = parseInt(quantity);
        // let qtyPerUnit = parseInt(quantityPerUnit);
        // if (units.length === 1) {
        //     return `${quantity} ${unit}`;
        // }
        // let st = qty / qtyPerUnit;
        // let str = Math.floor(st);
        // let rm = st.toString().split('.')[1];
        // let nr = `${str} ${units[0]}`;

        // if (rm) nr += ` ${rm} ${units[1]}`;

        // // return `${quantity} ${unit} / ${nr}`;
        // return nr;
        return `${quantity} ${unit}`;
    }
}
