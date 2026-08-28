// import React from "react";

// const SubscribeSection = () => {
//   return (
//     <div className="shadow-md mx-auto pt-24 pb-24">
//       <section className="bg-[#ff8ea0] text-white py-20 px-6 rounded-xl max-w-7xl mx-auto text-center">
//         <h2 className="text-4xl md:text-5xl font-bold mb-4">
//           Subscribe and Get <span className="text-white">10% Discount</span>
//         </h2>
//         <p className="text-lg mb-10">
//           Be the first to get the latest news, promotions and much more.
//         </p>

//         <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6 max-w-3xl mx-auto">
//           <input
//             type="email"
//             placeholder="Email"
//             className="w-full md:w-[500px] px-5 py-4 rounded-md text-black border border-white focus:outline-none"
//           />
//           <button className="bg-white text-black font-semibold px-6 py-4 rounded-md hover:bg-gray-200 transition cursor-pointer">
//             Subscribe
//           </button>
//         </div>

//         <p className="text-sm">Contact us if you need to know anything</p>
//       </section>
//     </div>
//   );
// };

// export default SubscribeSection;



import React, { useRef, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

const SubscribeSection = () => {
  const ref = useRef(null);
  const controls = useAnimation();
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [inView, controls]);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeUp}
      transition={{ duration: 0.8 }}
      className="shadow-md mx-auto pt-24 pb-24"
    >
      <motion.section
        variants={fadeUp}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="bg-[#ff8ea0] text-white py-20 px-6 rounded-xl max-w-7xl mx-auto text-center"
      >
        <motion.h2
          variants={fadeUp}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Subscribe and Get <span className="text-white">10% Discount</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg mb-10"
        >
          Be the first to get the latest news, promotions and much more.
        </motion.p>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6 max-w-3xl mx-auto"
        >
          <input
            type="email"
            placeholder="Email"
            className="w-full md:w-[500px] px-5 py-4 rounded-md text-black border border-white focus:outline-none"
          />
          <button className="bg-white text-black font-semibold px-6 py-4 rounded-md hover:bg-gray-200 transition cursor-pointer">
            Subscribe
          </button>
        </motion.div>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-sm"
        >
          Contact us if you need to know anything
        </motion.p>
      </motion.section>
    </motion.div>
  );
};

export default SubscribeSection;
