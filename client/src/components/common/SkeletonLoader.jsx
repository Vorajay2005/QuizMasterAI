import { motion } from "framer-motion";

const SkeletonLoader = ({ className = "", children }) => {
  return (
    <motion.div
      className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded ${className}`}
      animate={{
        backgroundPosition: ["200% 0", "-200% 0"],
      }}
      transition={{
        duration: 1.5,
        ease: "linear",
        repeat: Infinity,
      }}
      style={{
        backgroundSize: "200% 100%",
      }}
    >
      {children}
    </motion.div>
  );
};

export const QuizSkeleton = () => (
  <div className="card">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonLoader className="h-8 w-64" />
        <SkeletonLoader className="h-6 w-20" />
      </div>
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-3/4" />

      <div className="space-y-2 mt-6">
        <SkeletonLoader className="h-12 w-full" />
        <SkeletonLoader className="h-12 w-full" />
        <SkeletonLoader className="h-12 w-full" />
        <SkeletonLoader className="h-12 w-full" />
      </div>

      <div className="flex justify-between mt-6">
        <SkeletonLoader className="h-10 w-24" />
        <SkeletonLoader className="h-10 w-32" />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card">
          <div className="flex items-center space-x-4">
            <SkeletonLoader className="w-12 h-12 rounded-lg" />
            <div className="flex-1">
              <SkeletonLoader className="h-4 w-24 mb-2" />
              <SkeletonLoader className="h-8 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Recent Quizzes */}
    <div className="card">
      <SkeletonLoader className="h-6 w-48 mb-6" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <SkeletonLoader className="w-10 h-10 rounded" />
              <div>
                <SkeletonLoader className="h-4 w-48 mb-2" />
                <SkeletonLoader className="h-3 w-32" />
              </div>
            </div>
            <SkeletonLoader className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <SkeletonLoader className="h-8 w-64 mb-8" />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <SkeletonLoader className="h-6 w-32 mb-4" />
        <SkeletonLoader className="h-64 w-full" />
      </div>

      <div className="card">
        <SkeletonLoader className="h-6 w-32 mb-4" />
        <SkeletonLoader className="h-64 w-full" />
      </div>
    </div>
  </div>
);

export default SkeletonLoader;
