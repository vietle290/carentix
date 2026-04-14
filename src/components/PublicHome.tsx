'use client'
import HeroSection from './HeroSection'
import VehicleSlider from './VehicleSlider'
import AuthModal from './AuthModal'
import { useState } from 'react';

function PublicHome() {
    const [authOpen, setAuthOpen] = useState(false);
  return (
    <>
      <HeroSection />
      <VehicleSlider />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)}/>
    </>
  )
}

export default PublicHome
