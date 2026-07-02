'use client'
import HeroSection from './HeroSection'
import VehicleSlider from './VehicleSlider'
import AuthModal from './AuthModal'
import { useState } from 'react';

function PublicHome({aboutUsIdScroll, homeIdScroll}: {aboutUsIdScroll: string, homeIdScroll: string}) {
    const [authOpen, setAuthOpen] = useState(false);
    
  return (
    <>
      <HeroSection onAuthRequired={() => setAuthOpen(true)} homeIdScroll={homeIdScroll}/>
      <VehicleSlider id={aboutUsIdScroll}/>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)}/>
    </>
  )
}

export default PublicHome
