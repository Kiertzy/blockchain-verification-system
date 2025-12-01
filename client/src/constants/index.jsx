import { Home, NotepadText, Package, PackagePlus, UserCheck, UserPlus, Users, Award, UserCog, UserPen, ScanQrCode  } from "lucide-react";

export const navbarAdminLinks = [
    {
        title: "Dashboard",
        links: [
            {
                label: "Dashboard",
                icon: Home,
                path: "/dashboard",
            },
        ],
    },
    {
        title: "Users",
        links: [
            {
                label: "Pending Users",
                icon: Users,
                path: "/pending-users",
            },
            {
                label: "Verified Institutions",
                icon: UserPlus,
                path: "/institution",
            },
            {
                label: "Certificate Holder",
                icon: UserCheck,
                path: "/students",
            },
            {
                label: "Admin",
                icon: UserCog,
                path: "/admin",
            },
            {
                label: "Verifier",
                icon: UserPen,
                path: "/verifier",
            },
        ],
    },
    {
        title: "Education",
        links: [
            {
                label: "Colleges",
                icon: Users,
                path: "/colleges",
            },
            {
                label: "Courses",
                icon: UserPlus,
                path: "/courses",
            },
            {
                label: "Majors",
                icon: UserCheck,
                path: "/majors",
            },
        ],
    },
    // {
    //     title: "Certificates",
    //     links: [
    //         {
    //             label: "Verify Certificate",
    //             icon: Package,
    //             path: "/certificates/verify",
    //         },
    //         {
    //             label: "Bulk Verification",
    //             icon: PackagePlus,
    //             path: "/certificates/bulk-verification",
    //         },
    //     ],
    // },
];

export const navbarStudentLinks = [
    {
        title: "Dashboard",
        links: [
            {
                label: "Profile",
                icon: Package,
                path: "/student-dashboard",
            },
        ],
    },
];

export const navbarVerifierLinks = [
    {
       title: "Dashboard",
        links: [
            {
                label: "Dashboard",
                icon: Home,
                path: "/verifier/dashboard",
            },
            {
                label: "Reports",
                icon: NotepadText,
                path: "/verifier/reports",
            },
        ],
    },
    {
        title: "Certificates",
        links: [
            {
                label: "Verified Certificates",
                icon: Package,
                path: "verifier/certificates/verified-certificates",
            },
            {
                label: "Pending Certificates",
                icon: Package,
                path: "verifier/certificates/pending-certificates",
            },
            {
                label: "Not Verified Certificates",
                icon: Package,
                path: "verifier/certificates/not-verified-certificates",
            },
            // {
            //     label: "Verify Certificate",
            //     icon: Package,
            //     path: "verifier/certificates/verify",
            // },
            // {
            //     label: "Bulk Verification",
            //     icon: PackagePlus,
            //     path: "verifier/certificates/bulk-verification",
            // },
            {
                label: "QR Scanner",
                icon: ScanQrCode,
                path: "verifier/certificates/qr-scanner",
            },
        ],
    },
];


export const navbarInstitutionLinks = [
    {
        title: "Dashboard",
        links: [
            {
                label: "Dashboard",
                icon: Home,
                path: "/institution-dashboard",
            },
        ],
    },

    {
        title: "Certificates",
        links: [
            {
                label: "Issue Certificate",
                icon: Award,
                path: "/certificates/issue",
            },
            {
                label: "Student List",
                icon: PackagePlus,
                path: "/certificates/student/list",
            },
             {
                label: "Certificate Template",
                icon: PackagePlus,
                path: "/certificates/templates",
            },
        ],
    },
];

