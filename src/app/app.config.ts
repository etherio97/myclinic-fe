import { FuseNavigationItem } from '../@fuse/components/navigation';

export const BASE_URL = 'http://localhost:3000';

export const SERVICE_URLS = {
    DOCTOR_API: `${BASE_URL}/doctor`,
    PATIENT_API: `${BASE_URL}/patient`,
    ITEM_API: `${BASE_URL}/item`,
    RECEIPT_API: `${BASE_URL}/receipt`,
    AUTH_API: `${BASE_URL}/auth`,
    APPOINTMENT_API: `${BASE_URL}/appointment`,
};

export const MY_DATE_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY', // How the input is parsed from manual typing
    },
    display: {
        dateInput: 'DD/MM/YYYY', // How the date is displayed in the input field
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

export const APP_CONFIG = {
    ROLES: ['admin', 'manager', 'cashier'],
    GENDERS: ['Male', 'Female', 'Other'],
    BLOOD_TYPES: [
        'A',
        'B',
        'AB',
        'O',
        'A+',
        'A-',
        'B+',
        'B-',
        'AB+',
        'AB-',
        'O+',
        'O-',
    ],
    APPOINTMENT_TYPES: ['Old', 'New', 'Follow Up'],
    APPOINTMENT_CASES: [
        'OPD',
        'Laboratory',
        'Home Vist',
        'Daycare',
        'Ultrasound',
    ],
};

export const NAVIGATION_ITEMS: FuseNavigationItem[] = [
    {
        type: 'group',
        children: [
            {
                id: 'dashboard',
                title: 'Dashboard',
                type: 'basic',
                icon: 'mat_outline:dashboard',
                link: '/dashboard',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },
            {
                id: 'patients',
                title: 'Patients',
                type: 'basic',
                icon: 'mat_outline:people',
                link: '/patients',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },
            {
                id: 'receipts',
                title: 'Receipts',
                type: 'basic',
                icon: 'mat_outline:receipt_long',
                link: '/receipts',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },
            {
                id: 'appointments',
                title: 'Appointments',
                type: 'basic',
                icon: 'mat_outline:edit_calendar',
                link: '/appointments',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },
            {
                id: 'doctors',
                title: 'Doctors',
                type: 'basic',
                icon: 'mat_outline:local_hospital',
                link: '/doctors',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },
            {
                id: 'items',
                title: 'Items',
                type: 'basic',
                icon: 'mat_outline:inventory_2',
                link: '/items',
                meta: {
                    roles: ['admin', 'manager'],
                },
            },

            {
                id: 'users',
                title: 'Users',
                type: 'basic',
                icon: 'mat_outline:admin_panel_settings',
                link: '/users',
                meta: {
                    roles: ['admin'],
                },
            },
        ],
    },
];
