import { FuseNavigationItem } from '../@fuse/components/navigation';

export const __LANG = '__lang';

export const BASE_URL = ['localhost', '127.0.0.1', '192.168.1.40'].includes(
    location.hostname,
)
    ? `http://${location.hostname}:3000`
    : `${location.protocol}//${location.hostname}/api`;

export const SERVICE_URLS = {
    DOCTOR_API: `${BASE_URL}/doctor`,
    PATIENT_API: `${BASE_URL}/patient`,
    ITEM_API: `${BASE_URL}/item`,
    RECEIPT_API: `${BASE_URL}/receipt`,
    EXPENSE_API: `${BASE_URL}/expense`,
    AUTH_API: `${BASE_URL}/auth`,
    APPOINTMENT_API: `${BASE_URL}/appointment`,
    DASHBOARD_API: `${BASE_URL}/dashboard`,
    CASHFLOW_API: `${BASE_URL}/cashflow`,
    LAB_TEST_ITEM_API: `${BASE_URL}/lab-test-items`,
    LAB_ORDER_API: `${BASE_URL}/lab-orders`,
    LAB_RESULT_API: `${BASE_URL}/lab-results`,
};

export const APP_CONFIG = {
    ADMIN_ROLES: ['admin', 'manager', 'cashier', 'lab-admin', 'lab-cashier'],
    MANAGER_ROLES: ['cashier'],
    GENDERS: ['Male', 'Female'],
    APPOINTMENT_STATUS: ['Booked', 'Completed', 'No Show', 'Cancelled'],
    APPOINTMENT_TYPES: ['Old', 'New', 'Follow Up'],
    APPOINTMENT_CASES: [
        'OPD',
        'Laboratory',
        'Home Vist',
        'Daycare',
        'Ultrasound',
    ],
    ITEM_TYPES: ['Clinic', 'Laboratory'],
    PAYMENT_METHODS: ['Cash', 'MMQR', 'Credit', 'Other'],
    CASHFLOW_CATEGORY: ['Capital', 'Revenue', 'Operation', 'Personal', 'Other'],
    EXPENSE_CATEGORY: ['CF', 'Other', 'Pharmacy'],
    LAB_ITEM_TYPES: ['enum', 'numeric', 'richtext', 'text'],
    LAB_ORDER_STATUS: ['Completed', 'Pending', 'Deleted'],
};

export const NAVIGATION_ITEMS: FuseNavigationItem[] = [
    {
        type: 'group',
        children: [
            {
                id: 'dashboard',
                title: 'DASHBOARD',
                type: 'basic',
                icon: 'mat_solid:dashboard',
                link: '/dashboard',
                meta: {
                    roles: [
                        'admin',
                        'manager',
                        'cashier',
                        'lab-admin',
                        'lab-cashier',
                    ],
                },
            },
            {
                id: 'patients',
                title: 'PATIENTS',
                type: 'basic',
                icon: 'mat_solid:people',
                link: '/patients',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },
            {
                id: 'receipts',
                title: 'RECEIPTS',
                type: 'basic',
                icon: 'mat_solid:receipt_long',
                link: '/receipts',
                meta: {
                    roles: ['admin', 'manager', 'cashier', 'lab-admin'],
                },
            },
            {
                id: 'deleted-receipts',
                title: 'DELETED_RECEIPTS',
                type: 'basic',
                icon: 'mat_solid:restore',
                link: '/deleted-receipts',
                meta: {
                    roles: ['admin', 'manager'],
                },
            },
            {
                id: 'expense',
                title: 'EXPENSES',
                type: 'basic',
                icon: 'mat_solid:history_edu',
                link: '/expense',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },
            {
                id: 'appointments',
                title: 'APPOINTMENTS',
                type: 'basic',
                icon: 'mat_solid:edit_calendar',
                link: '/appointments',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },
            {
                id: 'appointment-calendar',
                title: 'APPOINTMENT_CALENDAR',
                type: 'basic',
                icon: 'heroicons_solid:calendar',
                link: '/appointment-calendar',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },
            {
                id: 'doctors',
                title: 'DOCTORS',
                type: 'basic',
                icon: 'mat_solid:local_hospital',
                link: '/doctors',
                meta: {
                    roles: ['admin', 'manager', 'cashier'],
                },
            },
            {
                id: 'items',
                title: 'ITEMS',
                type: 'basic',
                icon: 'mat_solid:inventory_2',
                link: '/items',
                meta: {
                    roles: ['admin', 'manager', 'cashier', 'lab-admin'],
                },
            },

            // Finance
            // {
            //     id: 'cashflow',
            //     title: 'CASHFLOW',
            //     type: 'basic',
            //     icon: 'heroicons_solid:cash',
            //     link: '/cashflow',
            //     meta: {
            //         roles: ['admin'],
            //     },
            // },
            {
                title: 'Laboratory',
                type: 'collapsable',
                icon: 'heroicons_solid:beaker',
                children: [
                    {
                        title: 'Orders',
                        type: 'basic',
                        link: '/laboratory/orders',
                    },
                    {
                        title: 'Reports',
                        type: 'basic',
                        link: '/laboratory/reports',
                    },
                    {
                        title: 'Test Items',
                        type: 'basic',
                        link: '/laboratory/items',
                    },
                ],
                meta: {
                    roles: ['admin', 'manager', 'lab-admin', 'lab-cashier'],
                },
            },

            // Admin
            {
                id: 'users',
                title: 'USERS',
                type: 'basic',
                icon: 'mat_solid:admin_panel_settings',
                link: '/users',
                meta: {
                    roles: ['admin', 'manager'],
                },
            },
        ],
    },
];

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

export const MESSAGES = {
    UNEXPECTED_ERROR: 'Unexpected error occuried!',
    SOMETHING_WENT_WRONG: 'အဆင်မပြေမှုတစ်ခုဖြစ်ပွားခဲ့ပါသည်။',
    PASSWORD_LENGTH_ERROR:
        'စကားဝှက်သည် အနည်းဆုံး စာလုံး (သို့မဟုတ်) ဂဏန်း ၆ လုံး ရှိရပါမည်။',
    MISMATCH_PASSWORD_ERROR: 'စကားဝှက်နှစ်ခုစလုံး တူညီရပါမည်။',
    CONFIRM_CHANGE_PASSWORD: 'စကားဝှက်အသစ် ပြောင်းရန် သေချာပါသလား?',
    REQUIRED_ALL_FIELDS: 'လိုအပ်သော အချက်အလက်များအားလုံးကို ဖြည့်သွင်းပါ။',
    REQUIRED_DATE_OF_BIRTH: 'မွေးသက္ကရာဇ် ထည့်သွင်းရန်လိုအပ်သည်။',
    SUCCESS_CHANGE_PASSWORD: 'သင့်စကားဝှက်ကို အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။',
    PLEASE_INPUT_ITEMS: 'ဝန်ဆောင်မှုများထည့်သွင်းပါ။',
    PLEASE_SELECT_PATIENT:
        'လူနာကို ပြန်ရွေးချယ်ပါ သို့မဟုတ် လူနာအသစ်ကို ဖန်တီးပါ။',
    PLEASE_SELECT_DOCTOR:
        'ဆရာဝန်ကို ပြန်ရွေးချယ်ပါ သို့မဟုတ် ဆရာဝန်အသစ်ကို ဖန်တီးပါ။',
    CONFIRM_CREATE_RECEIPT: 'ဘောက်ချာကို ဖန်တီးမှာ သေချာပါသလား?',
    CONFIRM_UPDATE_RECEIPT: 'ဘောက်ချာကို ပြင်ဆင်မှာ သေချာပါသလား?',
    CONFIRM_DELETE_RECEIPT: 'ဘောက်ချာကို ဖျက်မှာ သေချာပါသလား?',
    SUCCESS_DELETE_RECEIPT: 'ဘောက်ချာကို အောင်မြင်စွာ ဖျက်ပြီးပါပြီ။',
    CONFIRM_CREATE_PATIENT: 'လူနာအသစ်ကို ဖန်တီးမှာ သေချာပါသလား?',
    CONFIRM_UPDATE_PATIENT: 'လူနာကို ပြင်ဆင်မှာ သေချာပါသလား?',
    CONFIRM_DELETE_PATIENT: 'လူနာကို ဖျက်မှာ သေချာပါသလား?',
    FAILED_TO_DELETE_PATIENT: 'လူနာကို ဖျက်ခြင်း မအောင်မြင်ပါ။',
    SUCCESS_DELETE_PATIENT: 'လူနာကို အောင်မြင်စွာ ဖျက်ပြီးပါပြီ။',
    CONFIRM_CREATE_EXPENSE: 'အသုံးစရိတ်ကို ဖန်တီးမှာ သေချာပါသလား?',
    SUCCESS_CREATE_EXPENSE: 'အသုံးစရိတ်ကို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ။',
    CONFIRM_UPDATE_EXPENSE: 'အသုံးစရိတ်ကို ပြင်ဆင်မှာ သေချာပါသလား?',
    SUCCESS_UPDATE_EXPENSE: 'အသုံးစရိတ်ကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။',
    CONFIRM_DELETE_EXPENSE: 'အသုံးစရိတ်ကို ဖျက်မှာ သေချာပါသလား?',
    SUCCESS_DELETE_EXPENSE: 'အသုံးစရိတ်ကို အောင်မြင်စွာ ဖျက်ပြီးပါပြီ။',
    CONFIRM_CREATE_APPOINTMENT: 'ရက်ချိန်းကို ဖန်တီးမှာ သေချာပါသလား?',
    CONFIRM_UPDATE_APPOINTMENT: 'ရက်ချိန်းကို ပြင်ဆင်မှာ သေချာပါသလား?',
    CONFIRM_DELETE_APPOINTMENT: 'ရက်ချိန်းကို ဖျက်မှာ သေချာပါသလား?',
    SUCCESS_DELETE_APPOINTMENT: 'ရက်ချိန်းကို အောင်မြင်စွာ ဖျက်ပြီးပါပြီ။',
    CONFIRM_CREATE_DOCTOR: 'ဆရာဝန်ကို ဖန်တီးမှာ သေချာပါသလား?',
    CONFIRM_UPDATE_DOCTOR: 'ဆရာဝန်ကို ပြင်ဆင်မှာ သေချာပါသလား?',
    CONFIRM_DELETE_DOCTOR: 'ဆရာဝန်ကို ဖျက်မှာ သေချာပါသလား?',
    SUCCESS_DELETE_DOCTOR: 'ဆရာဝန်ကို အောင်မြင်စွာ ဖျက်ပြီးပါပြီ။',
    FAILED_TO_DELETE_DOCTOR: 'ဆရာဝန်ကို ဖျက်ခြင်း မအောင်မြင်ပါ။',
    CONFIRM_DEACTIVATE_DOCTOR: 'ဆရာဝန်ကို ပိတ်မည်မှာ သေချာပါသလား?',
    CONFIRM_ACTIVATE_DOCTOR: 'ဆရာဝန်ကို ဖွင့်မည်မှာ သေချာပါသလား?',
    CONFIRM_CREATE_USER: 'အသုံးပြုသူကို စာရင်းသွင်းရန် သေချာပါသလား?',
    SUCCESS_CREATE_USER: 'အသုံးပြုသူအသစ်ကို အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ။',
    CONFIRM_DELETE_USER: 'အသုံးပြုသူကို ဖျက်ရန် သေချာပါသလား?',
    SUCCESS_DELETE_USER: 'အသုံးပြုသူကို အောင်မြင်စွာဖျက်ပြီးပါပြီ။',
    CONFIRM_DEACTIVATE_USER: 'အသုံးပြုသူအား အကောင့်ပိတ်ရန် သေချာပါသလား?',
    CONFIRM_ACTIVATE_USER: 'အသုံးပြုသူအား အကောင့်ပြန်ဖွင့်ရန် သေချာပါသလား?',
    SUCCESS_USER_STATUS: 'အသုံးပြုသူ၏ အခြေအနေကို ပြောင်းလဲပြီးပါပြီ။',
    CONFIRM_DELETE_ITEM: 'ဝန်ဆောင်မှုကို ဖျက်ရန် သေချာပါသလား?',
    SUCCESS_DELETE_ITEM: 'ဝန်ဆောင်မှုကို အောင်မြင်စွာ ဖျက်ပြီးပါပြီ။',
    CONFIRM_CREATE_ITEM: 'ဝန်ဆောင်မှုကို ထည့်သွင်းရန် သေချာပါသလား။',
    CONFIRM_UPDATE_ITEM: 'ဝန်ဆောင်မှုကို ပြင်ဆင်ရန် သေချာပါသလား။',
};
