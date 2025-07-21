import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  School,
  ArrowRight,
  Brain,
} from "lucide-react";
import toast from "react-hot-toast";

import useAuthStore from "../../store/authStore";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch("password");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    // Remove confirmPassword before sending to backend
    const { confirmPassword, ...registrationData } = data;
    const result = await registerUser(registrationData);

    if (result.success) {
      toast.success("Account created successfully! Welcome! 🎉");
      navigate("/dashboard");
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  const gradeOptions = [
    { value: "9th", label: "9th Grade" },
    { value: "10th", label: "10th Grade" },
    { value: "11th", label: "11th Grade" },
    { value: "12th", label: "12th Grade" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center section-padding">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            whileHover={{ rotate: 20 }}
            className="mx-auto w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mb-4"
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-900 font-display">
            Join QuizMaster AI
          </h2>
          <p className="mt-2 text-gray-600">
            Create your account and start learning smarter
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Full Name"
              type="text"
              icon={User}
              placeholder="Enter your full name"
              error={errors.name?.message}
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
                maxLength: {
                  value: 50,
                  message: "Name must be less than 50 characters",
                },
              })}
            />

            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Grade Level
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <GraduationCap size={20} />
                </div>
                <select
                  className="input pl-10 bg-white"
                  {...register("grade", {
                    required: "Grade level is required",
                  })}
                >
                  <option value="">Select your grade</option>
                  {gradeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.grade && (
                <p className="text-error-600 text-sm flex items-center space-x-1">
                  <span>{errors.grade.message}</span>
                </p>
              )}
            </div>

            <Input
              label="School (Optional)"
              type="text"
              icon={School}
              placeholder="Enter your school name"
              error={errors.school?.message}
              {...register("school", {
                maxLength: {
                  value: 100,
                  message: "School name must be less than 100 characters",
                },
              })}
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Create a password"
              error={errors.password?.message}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />

            <Input
              label="Confirm Password"
              type="password"
              icon={Lock}
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Create Account
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
