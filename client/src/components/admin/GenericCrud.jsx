import {Edit2, Plus, Save, Trash2} from "lucide-react";
import React, {useCallback, useEffect, useState} from "react";
import SelectField from "./SelectField";
import InputField from "./InputField";
import {toast} from "react-toastify";
import Modal from "./Modal";
import MultiSelectField from "./MultiSelectField";

const GenericCrud = ({
  title,
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  columns,
  formFields,
  resourceName,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchFn();
      const payload = res.data.data || res.data.routes || res.data.stops || [];

      setData(payload);
    } catch (error) {
      console.warn(`Failed to fetch ${resourceName}`, error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, resourceName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

const handleEdit = (record) => {
  setCurrentRecord(record);

  setFormData({
    ...record,

    // ✅ FIX FOR STOP LAT/LNG
    lat: record.location?.coordinates[1] ?? "",
    lng: record.location?.coordinates[0] ?? "",

    routeId: record.routeId?._id
      ? String(record.routeId._id)
      : record.routeId
        ? String(record.routeId)
        : "",

    stops: Array.isArray(record.stops)
      ? record.stops
          .sort((a, b) => a.order - b.order)
          .map((s) => String(s.stopId?._id || s.stopId))
      : [],
  });

  setIsModalOpen(true);
};




  const handleDelete = async (id) => {
    if (
      window.confirm(`Are you sure you want to delete this ${resourceName}?`)
    ) {
      try {
        await deleteFn(id);
        fetchData();
      } catch (error) {
        toast.error("Delete failed");
        console.log(error);
      }
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const payload = {...formData};

    /**
     * STOPS HANDLING
     */
    if (Array.isArray(payload.stops)) {
      // from multi-select: ["id1", "id2"]
      payload.stops = payload.stops.map((stopId, index) => ({
        stop: stopId,
        order: index + 1,
      }));
    } else if (typeof payload.stops === "string") {
      // fallback for old JSON textarea (optional)
      try {
        payload.stops = JSON.parse(payload.stops);
      } catch {
        toast.error("Invalid stops format");
        return;
      }
    }

    // if (!payload.stops || payload.stops.length < 2) {
    //   toast.error("At least two stops are required");
    //   return;
    // }

    if (payload.lat !== undefined && payload.lng !== undefined) {
      payload.location = {
        type: "Point",
        coordinates: [
          Number(payload.lng), // lng first
          Number(payload.lat), // lat second
        ],
      };

      delete payload.lat;
      delete payload.lng;
    }
    // 🔥 FIX routeId
    if (payload.routeId && typeof payload.routeId === "object") {
      payload.routeId = payload.routeId.value || payload.routeId._id;
    }


    if (currentRecord) {
      await updateFn(currentRecord._id, payload);
    } else {
      await createFn(payload);
    }

    setIsModalOpen(false);
    fetchData();
    toast.success("Operation successful");
  } catch (error) {
    console.error(error);
    toast.error("Operation failed, please check console");
  }
};


  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
  };

  const handleAddNew = () => {
    setCurrentRecord(null);
    setFormData({});
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={handleAddNew}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>Add {resourceName}</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-6 py-4 font-semibold text-gray-700"
                    >
                      {col.header}
                    </th>
                  ))}
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No {resourceName.toLowerCase()}s found.
                    </td>
                  </tr>
                )}
                {data.map((item) => (
                  <tr
                    key={item?._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((col, idx) => (
                      <td key={idx} className="px-6 py-4">
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item?._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`${currentRecord ? "Edit" : "Add New"} ${resourceName}`}
        >
          <form onSubmit={handleSubmit}>
            {formFields.map((field, idx) => {
              if (field.type === "select") {
                return (
                  <SelectField
                    key={`${field.name}-${field.options.length}`}
                    label={field.label}
                    name={field.name}
                    value={String(formData[field.name] || "")}
                    onChange={handleInputChange}
                    options={field.options}
                    required={field.required}
                  />
                );
              }
              if (field.type === "multi-select") {
                return (
                  <MultiSelectField
                    key={`${field.name}-${field.options?.length || 0}`}
                    label={field.label}
                    name={field.name}
                    value={formData[field.name] || []}
                    onChange={handleInputChange}
                    options={field.options}
                    required={field.required}
                  />
                );
              }

              return (
                <InputField
                  key={idx}
                  label={field.label}
                  name={field.name}
                  type={field.type || "text"}
                  value={formData[field.name] || ""}
                  onChange={handleInputChange}
                  required={field.required}
                  placeholder={field.placeholder}
                />
              );
            })}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save size={18} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default GenericCrud;
