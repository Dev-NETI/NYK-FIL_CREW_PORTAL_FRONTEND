"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import * as Yup from "yup";
import {
  DepartmentCategoryService,
  DepartmentCategory,
} from "@/services/department-category";
import { DepartmentService, Department } from "@/services/department";
import { Admin } from "@/services/admin-management";
import toast from "react-hot-toast";

interface EditAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: FormData) => void;
  admin: Admin | null;
}

interface FormData {
  email: string;
  department_id: number | null;
  firstname: string;
  middlename: string;
  lastname: string;
}

// Validation schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  firstname: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .required("First name is required"),
  middlename: Yup.string().max(50, "Middle name must not exceed 50 characters"),
  lastname: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .required("Last name is required"),
  department_id: Yup.number().nullable().required("Department is required"),
});

export default function EditAdminModal({
  isOpen,
  onClose,
  onSubmit,
  admin,
}: EditAdminModalProps) {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    department_id: null,
    firstname: "",
    middlename: "",
    lastname: "",
  });

  const [departmentCategories, setDepartmentCategories] = useState<
    DepartmentCategory[]
  >([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data when modal opens or admin changes
  useEffect(() => {
    if (isOpen && admin) {
      // Populate form with admin data
      setFormData({
        email: admin.email,
        department_id: admin.department_id,
        firstname: admin.profile.firstname,
        middlename: admin.profile.middlename || "",
        lastname: admin.profile.lastname,
      });

      // Load department categories
      loadDepartmentCategories();

      // Set the category ID based on the admin's department
      // We'll need to fetch this or derive it from the department
      loadDepartmentAndCategory(admin.department_id);
    }
  }, [isOpen, admin]);

  // Load departments when category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      loadDepartmentsByCategory(selectedCategoryId);
    } else {
      setDepartments([]);
    }
  }, [selectedCategoryId]);

  const loadDepartmentCategories = async () => {
    try {
      const categories =
        await DepartmentCategoryService.getAllDepartmentCategories();
      setDepartmentCategories(categories);
    } catch (error) {
      console.error("Error loading department categories:", error);
      toast.error("Failed to load department categories");
    }
  };

  const loadDepartmentAndCategory = async (departmentId: number) => {
    try {
      setLoading(true);
      // Get all departments to find the one we need
      const allDepartments = await DepartmentService.getAllDepartments();
      const department = allDepartments.find((d) => d.id === departmentId);
      if (department) {
        setSelectedCategoryId(department.department_category_id);
      }
    } catch (error) {
      console.error("Error loading department:", error);
      toast.error("Failed to load department");
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentsByCategory = async (categoryId: number) => {
    try {
      setLoading(true);
      const departments = await DepartmentService.getDepartmentsByCategory(
        categoryId
      );
      setDepartments(departments);
    } catch (error) {
      console.error("Error loading departments:", error);
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "department_id" ? (value ? Number(value) : null) : value,
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!admin) return;

    try {
      // Validate form data
      await validationSchema.validate(formData, { abortEarly: false });

      // Call parent submit handler
      onSubmit(admin.id, formData);
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        // Convert yup errors to object
        const validationErrors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);

        // Show first error as toast
        const firstError = error.inner[0];
        if (firstError) {
          toast.error(firstError.message);
        }
      }
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      email: "",
      department_id: null,
      firstname: "",
      middlename: "",
      lastname: "",
    });
    setSelectedCategoryId(null);
    setDepartments([]);
    setErrors({});
    onClose();
  };

  if (!admin) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"
              onClick={handleClose}
            ></motion.div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>

            {/* Modal panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="inline-block overflow-hidden text-left align-bottom transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[10000]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Administrator
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-4">
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.email
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      placeholder="admin@nykfil.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="firstname"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstname"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.firstname
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      placeholder="John"
                    />
                    {errors.firstname && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.firstname}
                      </p>
                    )}
                  </div>

                  {/* Middle Name */}
                  <div>
                    <label
                      htmlFor="middlename"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Middle Name
                    </label>
                    <input
                      type="text"
                      id="middlename"
                      name="middlename"
                      value={formData.middlename}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.middlename
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      placeholder="Doe"
                    />
                    {errors.middlename && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.middlename}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="lastname"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastname"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.lastname
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      placeholder="Smith"
                    />
                    {errors.lastname && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lastname}
                      </p>
                    )}
                  </div>

                  {/* Department Category */}
                  <div>
                    <label
                      htmlFor="department_category"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Department Category{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="department_category"
                      value={selectedCategoryId || ""}
                      onChange={(e) =>
                        setSelectedCategoryId(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Department Category</option>
                      {departmentCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department */}
                  <div>
                    <label
                      htmlFor="department_id"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="department_id"
                      name="department_id"
                      value={formData.department_id || ""}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        errors.department_id
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      disabled={!selectedCategoryId || loading}
                    >
                      <option value="">
                        {loading
                          ? "Loading departments..."
                          : selectedCategoryId
                          ? "Select Department"
                          : "Select category first"}
                      </option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {errors.department_id && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.department_id}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Administrator
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
