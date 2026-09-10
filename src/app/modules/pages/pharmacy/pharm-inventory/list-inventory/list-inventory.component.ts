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
        'qtyPerUnit',
        'currentStock',
        'status',
        'minThreshold',
        'totalPurchased',
        'totalSold',
    ];

    displayedColumnsForExtra: string[] = [
        'code',
        'name',
        'currentStock',
        'minThreshold',
        'totalPurchased',
        'totalSold',
    ];

    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

    formGroup!: FormGroup;

    searchResult: any[] = [];

    lowStockItems: MatTableDataSource<any> = new MatTableDataSource<any>();

    outOfStockItems: MatTableDataSource<any> = new MatTableDataSource<any>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    role!: string;

    constructor(
        private _fb: FormBuilder,
        private _inventoryService: PharmInventoryService,
    ) {}

    ngOnInit(): void {
        this.formGroup = this._fb.group({
            searchValue: '',
            sortBy: 'name:asc',
        });

        this.formGroup.controls.sortBy.valueChanges.subscribe((value) =>
            this.sortData(value),
        );

        this.formGroup.controls.searchValue.valueChanges.subscribe((value) => {
            let filterValue = value.toLowerCase();
            this.dataSource.data = this.searchResult.filter(
                (option) =>
                    option.itemName.toLowerCase().includes(filterValue) ||
                    option.itemCode.toLowerCase().includes(filterValue),
            );
            this.sortData();
        });

        this.reloadData();
    }

    sortData(value: string | void) {
        const sortBy = value || this.formGroup.value.sortBy;
        switch (sortBy) {
            case 'name:asc':
                this.dataSource.data = this.dataSource.data.sort(
                    (a, b) => a.itemName - b.itemName,
                );
                break;
            // case 'name:desc':
            //     this.dataSource.data = this.dataSource.data.sort(
            //         (a, b) => b.itemName - a.itemName,
            //     );
            //     break;
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
        this._inventoryService.getAll().subscribe((result: any) => {
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

            this.sortData();
        });
    }

    calculateStock(
        quantity: string,
        unit: string,
        units: string[],
        quantityPerUnit: string,
    ) {
        let qty = parseInt(quantity);
        let qtyPerUnit = parseInt(quantityPerUnit);
        if (units.length === 1) {
            return `${quantity} ${unit}`;
        }
        let st = qty / qtyPerUnit;
        let str = Math.floor(st);
        let rm = st.toString().split('.')[1];
        let nr = `${str} ${units[0]}`;

        if (rm) nr += ` ${rm} ${units[1]}`;

        // return `${quantity} ${unit} / ${nr}`;
        return nr;
    }
}
