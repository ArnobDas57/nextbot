import { motion } from "framer-motion";
import Image from "next/image";

const Logo = () => {
  return (
    <div className="logo-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <Image src="/logo.png" width={150} height={150} alt="Logo" />
      </motion.div>
    </div>
  );
};

export default Logo;
