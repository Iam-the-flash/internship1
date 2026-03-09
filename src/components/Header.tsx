import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full px-6 py-4 flex items-center justify-between"
    >
      <Link to="/" className="flex items-center gap-2">
        <span className="text-3xl">🎮</span>
        <span className="text-2xl font-bold font-display text-foreground">
          Play<span className="text-primary">Learn</span>
        </span>
      </Link>
      <p className="hidden sm:block text-sm text-muted-foreground font-body">
        Click Once. Play Instantly. Learn Naturally.
      </p>
    </motion.header>
  );
};

export default Header;
