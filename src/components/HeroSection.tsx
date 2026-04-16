'use client'
import { Bike, Bus, Car, Truck } from "lucide-react"
import { motion } from "motion/react"

function HeroSection({onAuthRequired}: {onAuthRequired: () => void}) {
  return (
    <div className='relative min-h-screen w-full overflow-hidden'>
      <div className='absolute inset-0 bg-cover bg-center' style={{backgroundImage: "url('/heroImage.jpg')"}}/>
      <div className='absolute inset-0 bg-black/80'/>
      <div className='relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className='text-white max-w-2xl'>
          <h1 className='text-4xl md:text-6xl font-bold mb-4'>Welcome to Carentix</h1>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className='text-white text-md md:text-xl max-w-xl'>
          Your ultimate car rental experience. Book your dream car with ease and confidence.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }} className='mt-8 flex space-x-6 text-gray-300'>
          <Bus className='text-white w-12 h-12' />
          <Truck className='text-white w-12 h-12' />
          <Car className='text-white w-12 h-12' />
          <Bike className='text-white w-12 h-12' />
        </motion.div>
        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} className='mt-10 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-white/80 transition-colors cursor-pointer' onClick={onAuthRequired}>
          Book Now
        </motion.button>
      </div>
    </div>
  )
}

export default HeroSection
