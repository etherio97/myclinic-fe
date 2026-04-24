import { Component, Input, OnInit } from '@angular/core';

const SUCCESS: string[] = ['Active', 'Completed'];

const WARNING: string[] = ['Booked'];

const INFO: string[] = [];

const DANGER: string[] = ['Inactive', 'Deleted', 'Cancelled', 'No Show'];

@Component({
    selector: 'app-status-chip',
    templateUrl: './status-chip.component.html',
})
export class StatusChipComponent implements OnInit {
    @Input() status = '';

    ngClass() {
        return {
            'bg-teal-600': SUCCESS.includes(this.status),
            'bg-amber-600': WARNING.includes(this.status),
            'bg-indigo-600': INFO.includes(this.status),
            'bg-rose-600': DANGER.includes(this.status),
            'bg-slate-600': ![
                ...SUCCESS,
                ...WARNING,
                ...INFO,
                ...DANGER,
            ].includes(this.status),
        };
    }

    constructor() {}

    ngOnInit(): void {}
}
