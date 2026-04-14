'use client'
import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
const Nav_Items = ["Home", "Bookings", "About Us", "Contact"]
function Nav() {
  const pathName = usePathname();
  return (
    <motion.div initial={{y: -50, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{duration: 0.5}} className='fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#151414] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-3'>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        <Image src={"/logo.png"} alt="Logo" width={100} height={100} priority/>
        <div className="hidden md:flex items-center gap-10">
        {Nav_Items.map((item, index) => {
          let href;
          if(item === "Home"){
            href = "/";
          } else {
            href = `/${item.toLowerCase()}`;
          }
          const active = pathName === href;
          return <Link key={index} href={href} className={`text-sm font-medium transition ${active ? "text-white" : "text-gray-400 hover:text-white"}`}>{item}</Link>
        })}
      </div>
      <button className="px-4 py-1.5 rounded-full bg-white text-black text-sm">
        Login
      </button>
      </div>
    </motion.div>
  )
}

export default Nav
