import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, clearUserState } from "../../../store/slices/userSlice";

const PendingUsers = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    dispatch(getAllUsers());
    return () => {
      dispatch(clearUserState());
    };
  }, [dispatch]);

  // Filter only pending users + search
  const filteredUsers = users
    .filter((user) => user.accountStatus === "PENDING")
    .filter((user) => {
      const fullName = `${user.firstName} ${user.middleName} ${user.lastName}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="title">Pending Users</h1>

      {/* Search */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full max-w-md px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="rounded border border-gray-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
        <div className="border-b border-gray-200 dark:border-slate-700 p-4">
          <p className="text-lg font-medium text-slate-900 dark:text-white">
            List of Pending Users
          </p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-800 dark:text-white">
              Loading...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : (
            <>
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-2 border-b dark:border-slate-700">#</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">School ID</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">First Name</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">Middle Name</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">Last Name</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">Sex</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">Email</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">Role</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">College</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">Department</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">Major</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">Institution</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">Institution Position</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">Accreditation Info</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 dark:hover:bg-slate-800"
                      >
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {indexOfFirstUser + index + 1}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {user.studentId || "—"}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {user.firstName}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {user.middleName}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {user.lastName}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {user.sex}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {user.email}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {user.role}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {user.college || "—"}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {user.department || "—"}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {user.major || "—"}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {user.institutionName || "—"}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {user.institutionPosition || "—"}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {user.accreditationInfo || "—"}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-yellow-500 font-bold">
                          {user.accountStatus}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="15"
                        className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        No pending users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-x-2 py-4">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-1 border rounded text-sm ${
                        currentPage === index + 1
                          ? "bg-blue-500 text-white"
                          : "bg-white dark:bg-slate-700 text-blue-500 dark:text-blue-300 border-blue-500 dark:border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingUsers;
