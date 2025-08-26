import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message, Tooltip } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { verifyBulkCertificates, clearVerifyCertificateState } from "../../../store/slices/certificateSlice";

const BulkVerification = () => {
    const dispatch = useDispatch();
    const [certHashes, setCertHashes] = useState([""]); // start with one input

    const { bulkLoading, bulkError, bulkResults } = useSelector((state) => state.certificate);

    // Helper: find duplicates
    const findDuplicateIndexes = (arr) => {
        const seen = {};
        const duplicates = new Set();
        arr.forEach((hash, idx) => {
            const trimmed = hash.trim();
            if (trimmed) {
                if (seen[trimmed] !== undefined) {
                    duplicates.add(idx);
                    duplicates.add(seen[trimmed]);
                } else {
                    seen[trimmed] = idx;
                }
            }
        });
        return duplicates;
    };

    const duplicateIndexes = findDuplicateIndexes(certHashes);

    const handleCertHashChange = (index, value) => {
        const updated = [...certHashes];
        updated[index] = value;
        setCertHashes(updated);

        if (bulkError || bulkResults.length > 0) {
            dispatch(clearVerifyCertificateState());
        }
    };

    const addCertField = () => {
        setCertHashes([...certHashes, ""]);
    };

    const removeCertField = (index) => {
        const updated = certHashes.filter((_, i) => i !== index);
        setCertHashes(updated);
    };

    const handleBulkVerify = () => {
        const hashes = certHashes.map((h) => h.trim()).filter((h) => h);

        if (hashes.length === 0) {
            message.error("Please enter at least one certificate hash");
            return;
        }

        if (hashes.length < 2) {
            message.warning("Bulk verification requires at least 2 certificate hashes");
            return;
        }

        // Block verification if duplicates exist
        if (duplicateIndexes.size > 0) {
            message.warning("Duplicate certificate hashes detected. Please remove duplicates before verifying.");
            return;
        }

        dispatch(verifyBulkCertificates(hashes));
    };

    const exportVerifiedCertificatesCSV = () => {
        const verified = bulkResults.filter((r) => r.status === "success");

        if (verified.length === 0) {
            message.warning("No verified certificates to export.");
            return;
        }

        const csvHeader = [
            "#",
            "Certificate Hash",
            "Institution",
            "Certificate Name",
            "Student Name",
            "College",
            "Course",
            "Major",
            "Date Issued",
            "Status",
        ];

        const csvRows = verified.map((result, index) => [
            index + 1,
            result.certHash,
            result.certificate.nameOfInstitution,
            result.certificate.nameOfCertificate,
            result.certificate.nameOfStudent,
            result.certificate.college,
            result.certificate.course,
            result.certificate.major || "",
            new Date(result.certificate.dateIssued).toLocaleDateString(),
            result.certificate.certStatus,
        ]);

        const csvContent = [csvHeader, ...csvRows]
            .map((row) => row.map((val) => `"${val}"`).join(",")) // quote values
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "verified_certificates.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6 p-6">
            <h1 className="title">Bulk Verify Student Certificates</h1>

            <div className="w-full max-w-lg space-y-4">
                {certHashes.map((hash, idx) => {
                    const isDuplicate = duplicateIndexes.has(idx);
                    return (
                        <div
                            key={idx}
                            className="flex gap-2"
                        >
                            <div className="relative flex-1">
                                {isDuplicate && (
                                    <Tooltip title="Duplicate hash">
                                        <ExclamationCircleOutlined className="absolute right-2 top-2 text-red-500" />
                                    </Tooltip>
                                )}
                                <input
                                    type="text"
                                    placeholder={`Certificate hash #${idx + 1}`}
                                    value={hash}
                                    onChange={(e) => handleCertHashChange(idx, e.target.value)}
                                    className={`flex-1 rounded-md border px-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none dark:bg-slate-800 dark:text-white ${
                                        isDuplicate
                                            ? "border-red-500 focus:border-red-500"
                                            : "border-slate-300 focus:border-blue-500 dark:border-slate-600"
                                    }`}
                                    style={{ width: "100%" }}
                                />
                            </div>
                            {certHashes.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeCertField(idx)}
                                    className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    );
                })}

                <button
                    type="button"
                    onClick={addCertField}
                    className="rounded bg-green-500 px-3 py-2 text-white hover:bg-green-600"
                >
                    + Add Certificate
                </button>
            </div>

            <button
                onClick={handleBulkVerify}
                disabled={bulkLoading}
                className="w-full max-w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 sm:max-w-lg"
            >
                {bulkLoading ? "Verifying..." : "Verify All"}
            </button>

            {bulkLoading && <div className="mt-4 text-center text-blue-600 dark:text-blue-400">Verifying certificates...</div>}

            {bulkError && (
                <div className="mt-4 max-w-full break-words rounded border border-red-500 bg-red-100 px-4 py-2 text-center text-red-700 dark:bg-red-800 dark:text-red-300 sm:max-w-lg">
                    {bulkError}
                </div>
            )}

            {bulkResults.length > 0 && (
                <div className="mt-6 max-w-full space-y-4 sm:max-w-3xl">
                    {bulkResults.map((result, idx) => (
                        <div
                            key={idx}
                            className={`break-words rounded border p-4 ${
                                result.status === "success"
                                    ? "border-green-500 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : "border-red-500 bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                        >
                            <p>
                                <strong>Certificate Hash:</strong> {result.certHash}
                            </p>
                            <p>
                                <strong>Status:</strong> {result.status}
                            </p>
                            {result.status === "success" ? (
                                <>
                                    <p>
                                        <strong>Message:</strong> {result.message}
                                    </p>
                                    <p>
                                        <strong>Institution:</strong> {result.certificate.nameOfInstitution}
                                    </p>
                                    <p>
                                        <strong>Certificate Name:</strong> {result.certificate.nameOfCertificate}
                                    </p>
                                    <p>
                                        <strong>Student Name:</strong> {result.certificate.nameOfStudent}
                                    </p>
                                    <p>
                                        <strong>College:</strong> {result.certificate.college}
                                    </p>
                                    <p>
                                        <strong>Course:</strong> {result.certificate.course}
                                    </p>
                                    <p>
                                        <strong>Major:</strong> {result.certificate.major}
                                    </p>
                                    <p>
                                        <strong>Date Issued:</strong> {new Date(result.certificate.dateIssued).toLocaleDateString()}
                                    </p>
                                    <p>
                                        <strong>Status:</strong> {result.certificate.certStatus}
                                    </p>
                                </>
                            ) : (
                                <p>
                                    <strong>Error:</strong> {result.error}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/*A BUTTON HERE TO GENERATE REPORT OF THE CERTIFICATES THAT VERIFIES*/}
            {bulkResults.length > 0 && (
                <div className="mt-6 text-center">
                    <button
                        onClick={exportVerifiedCertificatesCSV}
                        className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                    >
                        Export Verified Certificates (CSV)
                    </button>
                </div>
            )}
        </div>
    );
};

export default BulkVerification;
