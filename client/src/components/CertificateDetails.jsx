import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const CertificateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { issuedCertificate } = useSelector((state) => state.issueCertificate);

  if (!issuedCertificate || issuedCertificate._id !== id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
          Certificate not found ❌
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8">
      <div className="w-full max-w-5xl">
        {/* Title */}
        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Certificate Details
        </h1>

        {/* Certificate Image */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-4xl rounded-lg border border-gray-300 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800">
            <img
              src={issuedCertificate.imageOfCertificate}
              alt="Certificate"
              className="w-full h-[600px] object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Certificate Info */}
        <div className="mt-8 grid grid-cols-1 gap-6 rounded-lg border border-gray-300 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-800 sm:grid-cols-2">
          <Detail label="Institution" value={issuedCertificate.nameOfInstitution} />
          <Detail label="Certificate Name" value={issuedCertificate.nameOfCertificate} />
          <Detail label="Student Name" value={issuedCertificate.nameOfStudent} />
          <Detail label="College" value={issuedCertificate.college} />
          <Detail label="Course" value={issuedCertificate.course} />
          <Detail label="Major" value={issuedCertificate.major} />
          <Detail label="Status" value={issuedCertificate.certStatus} />
          <Detail
            label="Date Issued"
            value={new Date(issuedCertificate.dateIssued).toLocaleString()}
          />
          <Detail
            label="Certificate Hash"
            value={issuedCertificate.certHash}
            fullWidth
            isHash
          />
          <Detail
            label="Transaction Hash"
            value={issuedCertificate.txHash}
            fullWidth
            isHash
          />
        </div>

        {/* Back Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate(-1)}
            className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value, fullWidth, isHash, isStatus }) => (
  <div className={`${fullWidth ? "col-span-2" : ""} flex flex-col`}>
    <span className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">
      {label}:
    </span>
    {isStatus ? (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold mt-1 ${
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
      <span className="mt-1 rounded-md bg-gray-100 px-2 py-1 text-xs sm:text-sm font-mono text-gray-700 break-all overflow-x-auto dark:bg-slate-700 dark:text-gray-200">
        {value || "N/A"}
      </span>
    ) : (
      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-200">
        {value || "N/A"}
      </span>
    )}
  </div>
);

export default CertificateDetails;
