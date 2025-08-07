import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllColleges, deleteCollege, addCollege } from "../../../store/slices/collegeSlice";
import { Trash, PencilLine, Plus } from "lucide-react";

const Colleges = () => {
  const dispatch = useDispatch();
  const { colleges, loading, error } = useSelector((state) => state.college);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [collegeName, setCollegeName] = useState("");
  const [collegeCode, setCollegeCode] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [collegeToDelete, setCollegeToDelete] = useState(null);
  const collegesPerPage = 10;

  useEffect(() => {
    dispatch(getAllColleges());
  }, [dispatch]);

  const handleDelete = async () => {
    if (collegeToDelete) {
      await dispatch(deleteCollege(collegeToDelete));
      setShowDeleteModal(false);
      setCollegeToDelete(null);
    }
  };

  const handleAddCollege = async (e) => {
    e.preventDefault();
    if (!collegeName.trim() || !collegeCode.trim()) return;

    await dispatch(addCollege({ collegeName, collegeCode }));
    setCollegeName("");
    setCollegeCode("");
    setShowModal(false);
  };

  const filteredColleges = colleges.filter((college) =>
    `${college.collegeName} ${college.collegeCode}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const indexOfLastCollege = currentPage * collegesPerPage;
  const indexOfFirstCollege = indexOfLastCollege - collegesPerPage;
  const currentColleges = filteredColleges.slice(indexOfFirstCollege, indexOfLastCollege);
  const totalPages = Math.ceil(filteredColleges.length / collegesPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="title">Colleges</h1>

      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full max-w-md px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          <Plus size={16} />
          Add College
        </button>
      </div>

      <div className="rounded border border-gray-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
        <div className="border-b border-gray-200 dark:border-slate-700 p-4">
          <p className="text-lg font-medium text-slate-900 dark:text-white">List of Colleges</p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-800 dark:text-white">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : (
            <>
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-2 border-b dark:border-slate-700">#</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">College Name</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">Code</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentColleges.length > 0 ? (
                    currentColleges.map((college, index) => (
                      <tr
                        key={college._id}
                        className="hover:bg-gray-50 dark:hover:bg-slate-800"
                      >
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {indexOfFirstCollege + index + 1}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {college.collegeName}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {college.collegeCode}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-center">
                          <div className="flex justify-center gap-x-2">
                            <button className="text-blue-500 dark:text-blue-400">
                              <PencilLine size={18} />
                            </button>
                            <button
                              className="text-red-500 dark:text-red-400"
                              onClick={() => {
                                setCollegeToDelete(college._id);
                                setShowDeleteModal(true);
                              }}
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        No colleges found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-x-2 py-4">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add College</h2>
            <form onSubmit={handleAddCollege} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">College Name</label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">College Code</label>
                <input
                  type="text"
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm border border-gray-400 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this college?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm border border-gray-400 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Colleges;
