import { Route } from '@angular/router';
import { NewRequisitionComponent } from './new-requisition/new-requisition.component';
import { LabResultEntryComponent } from './lab-result-entry/lab-result-entry.component';
import { LabReportDetailComponent } from './lab-report-detail/lab-report-detail.component';
import { LabItemListComponent } from './lab-item-list/lab-item-list.component';
import { CreateLabItemComponent } from './create-lab-item/create-lab-item.component';
import { EditLabItemComponent } from './edit-lab-item/edit-lab-item.component';
import { LabOrderListComponent } from './lab-order-list/lab-order-list.component';
import { EditRequisitionComponent } from './edit-requisition/edit-requisition.component';
import { LabResultListComponent } from './lab-result-list/lab-result-list.component';
import { LabResultEditComponent } from './lab-result-edit/lab-result-edit.component';

export const laboratoryRoutes: Route[] = [
    {
        path: 'items',
        component: LabItemListComponent,
    },
    {
        path: 'items/create',
        component: CreateLabItemComponent,
    },
    {
        path: 'items/edit/:id',
        component: EditLabItemComponent,
    },
    {
        path: 'orders',
        component: LabOrderListComponent,
    },
    {
        path: 'orders/create',
        component: NewRequisitionComponent,
    },
    {
        path: 'orders/edit/:id',
        component: EditRequisitionComponent,
    },
    {
        path: 'orders/report/:id',
        component: LabResultEntryComponent,
    },
    {
        path: 'reports',
        component: LabResultListComponent,
    },
    {
        path: 'reports/:id',
        component: LabReportDetailComponent,
    },
    {
        path: 'reports/edit/:id',
        component: LabResultEditComponent,
    },
];
