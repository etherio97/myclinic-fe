import { Component, Input, OnInit } from '@angular/core';

const SUCCESS = ['Active'];

const DANGER = ['Inactive', 'Deleted'];

@Component({
    selector: 'app-status-chip',
    templateUrl: './status-chip.component.html',
})
export class StatusChipComponent implements OnInit {
    @Input() status = '';

    ngClass() {
        return {
            'bg-teal-600': SUCCESS.includes(this.status),
            'bg-rose-600': DANGER.includes(this.status),
            'bg-slate-600': ![...SUCCESS, ...DANGER].includes(this.status),
        };
    }

    constructor() {}

    ngOnInit(): void {}
}
