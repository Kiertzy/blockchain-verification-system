import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Footer } from "@/layouts/footer";
import { Users, ShieldCheck, Clock, BookOpen, GraduationCap, School, FileText, UserCog, UserCheck } from "lucide-react";

// Redux slices
import { getAllUsers } from "../../../store/slices/userSlice";
import { getAllMajors } from "../../../store/slices/majorSlice";
import { getAllCourses } from "../../../store/slices/courseSlice";
import { getAllColleges } from "../../../store/slices/collegeSlice";
import { fetchAllCertificates } from "../../../store/slices/certViewSlice";

const DashboardPage = () => {
    const dispatch = useDispatch();

    // Redux states
    const { users } = useSelector((state) => state.users);
    const { colleges } = useSelector((state) => state.college);
    const { courses } = useSelector((state) => state.course);
    const { majors } = useSelector((state) => state.major);
    const { certificates } = useSelector((state) => state.allCertificates);

    // Fetch data on mount
    useEffect(() => {
        dispatch(getAllUsers());
        dispatch(getAllColleges());
        dispatch(getAllCourses());
        dispatch(getAllMajors());
        dispatch(fetchAllCertificates());
    }, [dispatch]);

    // Counters
    const totalVerifiedUsers = users?.filter((u) => u.accountStatus === "APPROVED").length || 0;
    const totalPendingUsers = users?.filter((u) => u.accountStatus === "PENDING").length || 0;
    const totalStudents = users?.filter((u) => u.role === "STUDENT").length || 0;
    const totalAdmins = users?.filter((u) => u.role === "ADMIN").length || 0;
    const totalVerifiers = users?.filter((u) => u.role === "INSTITUTION").length || 0;

    return (
        <div className="flex flex-col gap-y-6">
            <h1 className="title">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Verified Users */}
                <div className="card">
                    <div className="card-header">
                        <ShieldCheck
                            className="text-green-600"
                            size={28}
                        />
                        <p className="card-title">Verified Users</p>
                    </div>
                    <div className="card-body bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                        <p className="text-3xl font-bold">{totalVerifiedUsers}</p>
                    </div>
                </div>

                {/* Pending Users */}
                <div className="card">
                    <div className="card-header">
                        <Clock
                            className="text-yellow-600"
                            size={28}
                        />
                        <p className="card-title">Pending Users</p>
                    </div>
                    <div className="card-body bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                        <p className="text-3xl font-bold">{totalPendingUsers}</p>
                    </div>
                </div>

                {/* Colleges */}
                <div className="card">
                    <div className="card-header">
                        <School
                            className="text-blue-600"
                            size={28}
                        />
                        <p className="card-title">Colleges</p>
                    </div>
                    <div className="card-body bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                        <p className="text-3xl font-bold">{colleges?.length || 0}</p>
                    </div>
                </div>

                {/* Courses */}
                <div className="card">
                    <div className="card-header">
                        <BookOpen
                            className="text-indigo-600"
                            size={28}
                        />
                        <p className="card-title">Courses</p>
                    </div>
                    <div className="card-body bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                        <p className="text-3xl font-bold">{courses?.length || 0}</p>
                    </div>
                </div>

                {/* Majors */}
                <div className="card">
                    <div className="card-header">
                        <GraduationCap
                            className="text-purple-600"
                            size={28}
                        />
                        <p className="card-title">Majors</p>
                    </div>
                    <div className="card-body bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                        <p className="text-3xl font-bold">{majors?.length || 0}</p>
                    </div>
                </div>

                {/* Certificates */}
                <div className="card">
                    <div className="card-header">
                        <FileText
                            className="text-red-600"
                            size={28}
                        />
                        <p className="card-title">Certificates</p>
                    </div>
                    <div className="card-body bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                        <p className="text-3xl font-bold">{certificates?.length || 0}</p>
                    </div>
                </div>

                {/* Students */}
                <div className="card">
                    <div className="card-header">
                        <Users
                            className="text-pink-600"
                            size={28}
                        />
                        <p className="card-title">Students</p>
                    </div>
                    <div className="card-body bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                        <p className="text-3xl font-bold">{totalStudents}</p>
                    </div>
                </div>

                {/* Admins */}
                <div className="card">
                    <div className="card-header">
                        <UserCog
                            className="text-orange-600"
                            size={28}
                        />
                        <p className="card-title">Admins</p>
                    </div>
                    <div className="card-body bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                        <p className="text-3xl font-bold">{totalAdmins}</p>
                    </div>
                </div>

                {/* Verifiers */}
                <div className="card">
                    <div className="card-header">
                        <UserCheck
                            className="text-cyan-600"
                            size={28}
                        />
                        <p className="card-title">Verifiers</p>
                    </div>
                    <div className="card-body bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                        <p className="text-3xl font-bold">{totalVerifiers}</p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default DashboardPage;
