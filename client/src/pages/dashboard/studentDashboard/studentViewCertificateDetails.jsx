import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { fetchCertificateById, clearAllCertificatesState } from "../../../store/slices/certViewSlice";

const StudentCertificateDetails = () => {
    const { certId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { certificate, loading, error } = useSelector((state) => state.allCertificates);

    const { theme, setTheme } = useTheme();
    const verifyUrl = `${window.location.origin}/certificates/student/verify/${certId}`;

    useEffect(() => {
        if (certId) dispatch(fetchCertificateById(certId));
        return () => dispatch(clearAllCertificatesState());
    }, [certId, dispatch]);

    if (loading) return <div className="p-6 text-gray-700 dark:text-gray-200">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!certificate)
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 dark:bg-slate-900">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Certificate not found ❌</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-6 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                    Go Back
                </button>
            </div>
        );

    // Public link for certificate (adjust if your certs have a public page)
    const certificateUrl = `${window.location.origin}/certificates/student/certificate/view/${certId}`;

    const handleShare = async () => {
        try {
            if (navigator.share) {
                // Native mobile/web share dialog
                await navigator.share({
                    title: "My Certificate",
                    text: "Check out my certificate!",
                    url: certificateUrl,
                });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(certificateUrl);
                alert("Certificate link copied to clipboard!");
            }
        } catch (err) {
            console.error("Error sharing certificate:", err);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-white px-4 py-8 transition-colors dark:bg-slate-900">
            {/* Dark Mode Toggle */}
            <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="absolute right-4 top-4 rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-slate-800"
            >
                <Sun
                    size={20}
                    className="text-slate-700 dark:hidden"
                />
                <Moon
                    size={20}
                    className="hidden text-slate-100 dark:block"
                />
            </button>

            <div className="w-full max-w-5xl">
                {/* Title */}
                <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">Certificate Details</h1>

                {/* Certificate Image */}
                <div className="flex w-full justify-center">
                    <div className="w-full max-w-4xl rounded-lg border border-gray-300 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
                        <img
                            src={certificate.imageOfCertificate}
                            alt="Certificate"
                            className="h-[600px] w-full rounded-lg object-contain"
                        />
                    </div>
                </div>

                {/* Certificate Info */}
                <div className="mt-8 grid grid-cols-1 gap-6 rounded-lg border border-gray-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 sm:grid-cols-2">
                    <Detail
                        label="Date Issued"
                        value={certificate.dateIssued ? new Date(certificate.dateIssued).toLocaleString() : "N/A"}
                    />
                    <Detail
                        label="Certificate Hash"
                        value={certificate.certHash}
                        fullWidth
                        isHash
                    />
                </div>

                <div className="mt-12 flex w-full justify-center px-4">
                    <div className="flex w-full max-w-sm flex-col items-center justify-center rounded-2xl border border-gray-300 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-slate-800">
                        <span className="mb-4 text-center text-lg font-semibold text-gray-800 dark:text-gray-100">Verification QR Code</span>

                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600">
                            <QRCodeCanvas
                                value={verifyUrl}
                                size={220} 
                                bgColor="#ffffff"
                                fgColor="#000000"
                                level="H"
                                includeMargin
                            />
                        </div>

                        <span className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">Scan to verify certificate</span>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleShare}
                        className="w-full max-w-xs rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
                    >
                        Share Certificate
                    </button>
                </div>
            </div>
        </div>
    );
};

const Detail = ({ label, value, fullWidth, isHash, isStatus }) => (
    <div className={`${fullWidth ? "col-span-2" : ""} flex flex-col`}>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 sm:text-base">{label}:</span>
        {isStatus ? (
            <span
                className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    value === "CONFIRMED"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : value === "REVOKED"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300"
                }`}
            >
                {value}
            </span>
        ) : isHash ? (
            <span className="mt-1 overflow-x-auto break-all rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700 dark:bg-slate-700 dark:text-gray-200 sm:text-sm">
                {value || "N/A"}
            </span>
        ) : (
            <span className="text-sm text-gray-700 dark:text-gray-200 sm:text-base">{value || "N/A"}</span>
        )}
    </div>
);

export default StudentCertificateDetails;
