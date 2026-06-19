// import { useTheme } from "@/hooks/useTheme";
// import { motion } from "framer-motion";
// import Lottie from "lottie-react";
// import loadingAnimation from "@/public/assets/lottis/load5.json";

// interface LoadingStyleProps {
//     label?: string;
//     size?: string | number;
// }

// const LoadingStyle = ({ label, size = 15 }: LoadingStyleProps) => {
//     const { theme } = useTheme();
//     const isDark = theme === 'dark';

//     // Convert size to a valid number if it's a string
//     const numericSize = typeof size === 'string' ? parseFloat(size) : size;
//     // Base scale factor for the Lottie animation
//     const scaleFactor = numericSize / 10;

//     return (

//         <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, ease: "easeOut" }}
//             className={`relative flex flex-col items-center justify-center p-10 md:p-16 rounded-[2.5rem] border overflow-hidden
//                 ${isDark
//                     ? "bg-red-500/[0.03] border-blue-500/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(239,68,68,0.1)]"
//                     : "bg-white/40 border-blue-100/50 backdrop-blur-md shadow-[0_20px_50px_rgba(239,68,68,0.05)]"
//                 }`}
//         >

//             <div className={`relative flex items-center justify-center rounded-[3rem] border transition-all duration-500
//                 ${isDark
//                     ? "bg-white/[0.02] border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
//                     : "bg-blue-50/30 border-blue-100/50 shadow-[0_20px_50px_rgba(59,130,246,0.05)]"
//                 }`}
//                 style={{
//                     padding: `${2 * scaleFactor}rem`,
//                     backdropFilter: 'blur(12px)'
//                 }}
//             >
//                 {/* Background Glow */}
//                 <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500
//                     ${isDark ? "bg-blue-500/20" : "bg-blue-400/10"}`}
//                 />

//                 <div
//                     className="relative z-10"
//                     style={{
//                         width: `${numericSize * 0.8}rem`,
//                         height: `${numericSize * 0.8}rem`,
//                         maxWidth: '100vw'
//                     }}
//                 >
//                     <Lottie
//                         animationData={loadingAnimation}
//                         loop={true}
//                         className="w-full h-full"
//                     />

//                 </div>

//             </div>


//             {label && (

//                 <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.3 }}
//                     className="mt-8 flex flex-col items-center"
//                 >
//                     <p className={`text-lg md:text-xl font-bold tracking-tight text-center animate-pulse transition-colors duration-500
//                         ${isDark ? 'text-blue-100/80' : 'text-blue-900/70'}`}
//                     >
//                         {label}
//                     </p>
//                     <div className={`h-1 w-12 rounded-full mt-2 transition-colors duration-500
//                         ${isDark ? 'bg-blue-500/30' : 'bg-blue-500/20'}`}
//                     />
//                 </motion.div>

//             )}

//         </motion.div>

//     );

// };

// export default LoadingStyle;


























// components/special/loadingStyle.tsx
"use client";

import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import loadingAnimation from "@/public/assets/lottis/load5.json";

interface LoadingStyleProps {
  label?: string;
  size?: string | number;
}

const LoadingStyle = ({ label, size = 15 }: LoadingStyleProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const numericSize = typeof size === "string" ? parseFloat(size) : size;
  const scaleFactor = numericSize / 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`
        relative flex flex-col items-center justify-center p-10 md:p-16 rounded-[2.5rem] border overflow-hidden
        ${
          isDark
            ? "bg-primary/5 border-primary/20 backdrop-blur-xl shadow-[0_20px_50px_rgba(229,138,43,0.15)]"
            : "bg-white/40 border-primary/10 backdrop-blur-md shadow-[0_20px_50px_rgba(229,138,43,0.08)]"
        }
      `}
    >
      <div
        className={`
          relative flex items-center justify-center rounded-[3rem] border transition-all duration-500
          ${
            isDark
              ? "bg-white/[0.02] border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
              : "bg-primary/5 border-primary/20 shadow-[0_20px_50px_rgba(229,138,43,0.05)]"
          }
        `}
        style={{
          padding: `${2 * scaleFactor}rem`,
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          className={`
            absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500
            ${isDark ? "bg-primary/30" : "bg-primary/20"}
          `}
        />
        <div
          className="relative z-10"
          style={{
            width: `${numericSize * 0.8}rem`,
            height: `${numericSize * 0.8}rem`,
            maxWidth: "100vw",
          }}
        >
          <Lottie animationData={loadingAnimation} loop={true} className="w-full h-full" />
        </div>
      </div>

      {label && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col items-center"
        >
          <p
            className={`
              text-lg md:text-xl font-bold tracking-tight text-center animate-pulse transition-colors duration-500
              ${isDark ? "text-primary/80" : "text-primary/70"}
            `}
          >
            {label}
          </p>
          <div
            className={`
              h-1 w-12 rounded-full mt-2 transition-colors duration-500
              ${isDark ? "bg-primary/40" : "bg-primary/30"}
            `}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default LoadingStyle;