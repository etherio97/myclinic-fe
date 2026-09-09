import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { pharmRoutes } from './pharmacy.routing';

@NgModule({
    declarations: [],
    imports: [RouterModule.forChild(pharmRoutes)],
    providers: [],
})
export class PharmacyModule {}
