import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { verifyCertificate, clearVerifyCertificateState } from "../../../store/slices/certificateSlice";

const VerifyCertificates = () => {
  const dispatch = useDispatch();
  const [certhash, setCerthash] = useState("");

  const {
    loading,
    error,
    message: successMsg,
    certificateData,
  } = useSelector((state) => state.certificate);

  const handleVerify = () => {
    if (!certhash.trim()) {
      message.error("Please enter a certificate hash");
      return;
    }

    dispatch(verifyCertificate(certhash));
  };

  // Clear error/message when input changes
  const handleInputChange = (e) => {
    setCerthash(e.target.value);
    if (error || successMsg) {
      dispatch(clearVerifyCertificateState());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center px-4 sm:px-0">
        Verify Student Certificate
      </h1>

      <input
        type="text"
        placeholder="Paste certificate hash here..."
        value={certhash}
        onChange={handleInputChange}
        className="w-full max-w-full sm:max-w-md rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
      />

      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full max-w-full sm:max-w-md rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      {/* Loading animation */}
      {loading && (
        <div className="text-blue-600 dark:text-blue-400 mt-4 text-center">
          Verifying certificate...
        </div>
      )}

      {/* Show error */}
      {error && (
        <div className="mt-4 rounded border border-red-500 bg-red-100 px-4 py-2 text-red-700 dark:bg-red-800 dark:text-red-300 max-w-full sm:max-w-md text-center break-words">
          {error}
        </div>
      )}

      {/* Show success and certificate details */}
      {successMsg && certificateData && (
        <div className="mt-6 max-w-full sm:max-w-2xl rounded border border-green-500 bg-green-50 p-4 text-green-800 dark:bg-green-900 dark:text-green-300 break-words">
          <h2 className="mb-2 text-lg font-semibold">Certificate Verified ✅</h2>
          <p><strong>Message:</strong> {successMsg}</p>
          <p><strong>Institution:</strong> {certificateData.nameOfInstitution}</p>
          <p><strong>Certificate Name:</strong> {certificateData.nameOfCertificate}</p>
          <p><strong>Student Name:</strong> {certificateData.nameOfStudent}</p>
          <p><strong>College:</strong> {certificateData.college}</p>
          <p><strong>Course:</strong> {certificateData.course}</p>
          <p><strong>Major:</strong> {certificateData.major}</p>
          <p className="break-all"><strong>Certificate Hash:</strong> {certificateData.certHash}</p>
          <p className="break-all"><strong>Transaction Hash:</strong> {certificateData.txHash}</p>
          <p className="break-all"><strong>Student Wallet:</strong> {certificateData.walletAddressStudent}</p>
          <p className="break-all"><strong>Institution Wallet:</strong> {certificateData.walletAddressInstitution}</p>
          <p><strong>Date Issued:</strong> {new Date(certificateData.dateIssued).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {certificateData.certStatus}</p>
        </div>
      )}
    </div>
  );
};

export default VerifyCertificates;
