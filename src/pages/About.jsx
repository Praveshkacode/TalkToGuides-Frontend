import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div>

      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>ABOUT <span className='text-gray-700 font-medium'>US</span></p>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[360px]' src={assets.about_image} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
          <p>TalkToGuides is an online platform for personalized spiritual guidance where individuals can connect with verified psychic experts for Live Chat, Voice Call, or Email Reading sessions across a wide range of categories.</p>
          <p>Find a guide or apply to become a guide.
              We help you find the right expert and connect instantly through pay-per-second live chat or voice call, or choose detailed email readings — all designed to help you receive trusted insights on your situation, questions, or concerns. Whether it’s love, career, life purpose, or personal growth, our experienced advisors are here to deliver clear, honest, and empowering guidance tailored just for you.Our qualified experts are available 24/7 to support you with compassionate wisdom and help you navigate life's challenges in the most efficient, secure, and meaningful way.</p>
        <b className='text-gray-800'>Our Vision</b>
        <p>Our vision at TalkToGuides is to connect individuals with trusted spiritual experts for instant clarity, guidance, and peace of mind—anytime, anywhere.</p>
        </div>
      </div>
      <div className='text-xl my-4'>
        <p>WHY <span className='text-gray-700 font-semibold'>CHOOSE US</span></p>

      </div>
      <div className='flex flex-col md:flex-row mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>Efficiency:</b>
          <p>Instant access to expert guidance through live chat and voice calls—anytime, anywhere.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>Convenience:</b>
          <p>Connect with trusted spiritual advisors across categories from the comfort of your home.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>Personalization:</b>
          <p>Receive tailored insights and recommendations based on your unique life questions and concerns.</p>
        </div>
        
      </div>
    </div>
  )
}

export default About
