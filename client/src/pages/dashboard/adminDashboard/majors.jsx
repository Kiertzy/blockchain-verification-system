import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllMajors,
  deleteMajor,
  addMajor,
  updateMajor,
} from "../../../store/slices/majorSlice";
import { Trash, PencilLine, Plus } from "lucide-react";

const Majors = () => {
  const dispatch = useDispatch();
  const { majors, loading, error } = useSelector((state) => state.major);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMajorName, setNewMajorName] = useState("");
  const [newMajorCode, setNewMajorCode] = useState("");

  // Update Modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editMajorId, setEditMajorId] = useState(null);
  const [editMajorName, setEditMajorName] = useState("");
  const [editMajorCode, setEditMajorCode] = useState("");

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [majorToDelete, setMajorToDelete] = useState(null);

  const majorsPerPage = 10;

  useEffect(() => {
    dispatch(getAllMajors());
  }, [dispatch]);

  const handleDelete = async () => {
    if (majorToDelete) {
      await dispatch(deleteMajor(majorToDelete));
      setShowDeleteModal(false);
      setMajorToDelete(null);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newMajorName.trim() || !newMajorCode.trim()) return;

    await dispatch(addMajor({ majorName: newMajorName, majorCode: newMajorCode }));

    setNewMajorName("");
    setNewMajorCode("");
    setShowAddModal(false);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editMajorName.trim() || !editMajorCode.trim() || !editMajorId) return;

    await dispatch(updateMajor({ id: editMajorId, majorName: editMajorName, majorCode: editMajorCode }));

    setEditMajorId(null);
    setEditMajorName("");
    setEditMajorCode("");
    setShowUpdateModal(false);
  };

  const filteredMajors = majors.filter((major) =>
    `${major.majorName} ${major.majorCode}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastMajor = currentPage * majorsPerPage;
  const indexOfFirstMajor = indexOfLastMajor - majorsPerPage;
  const currentMajors = filteredMajors.slice(indexOfFirstMajor, indexOfLastMajor);
  const totalPages = Math.ceil(filteredMajors.length / majorsPerPage);

  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="title">Majors</h1>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:max-w-md px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          <Plus size={16} />
          Add Major
        </button>
      </div>

      <div className="rounded border border-gray-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
        <div className="border-b border-gray-200 dark:border-slate-700 p-4">
          <p className="text-lg font-medium text-slate-900 dark:text-white">List of Majors</p>
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
                    <th className="px-4 py-2 border-b dark:border-slate-700">Major Name</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700">Code</th>
                    <th className="px-4 py-2 border-b dark:border-slate-700 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMajors.length > 0 ? (
                    currentMajors.map((major, index) => (
                      <tr key={major._id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {indexOfFirstMajor + index + 1}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {major.majorName}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-slate-800 dark:text-gray-200">
                          {major.majorCode}
                        </td>
                        <td className="px-4 py-2 border-b dark:border-slate-700 text-center">
                          <div className="flex justify-center gap-x-2">
                            <button
                              className="text-blue-500 dark:text-blue-400"
                              onClick={() => {
                                setEditMajorId(major._id);
                                setEditMajorName(major.majorName);
                                setEditMajorCode(major.majorCode);
                                setShowUpdateModal(true);
                              }}
                            >
                              <PencilLine size={18} />
                            </button>

                            <button
                              className="text-red-500 dark:text-red-400"
                              onClick={() => {
                                setMajorToDelete(major._id);
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
                      <td colSpan="4" className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                        No majors found.
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Major</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Major Name</label>
                <input
                  type="text"
                  value={newMajorName}
                  onChange={(e) => setNewMajorName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Major Code</label>
                <input
                  type="text"
                  value={newMajorCode}
                  onChange={(e) => setNewMajorCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm border border-gray-400 rounded bg-white dark:bg-slate-800"
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

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Update Major</h2>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Major Name</label>
                <input
                  type="text"
                  value={editMajorName}
                  onChange={(e) => setEditMajorName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Major Code</label>
                <input
                  type="text"
                  value={editMajorCode}
                  onChange={(e) => setEditMajorCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 text-sm border border-gray-400 rounded bg-white dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Update
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
            <p className="mb-6">Are you sure you want to delete this major?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm border border-gray-400 rounded bg-white dark:bg-slate-800"
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
}

export default Majors
