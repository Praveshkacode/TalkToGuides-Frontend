import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopExperts from '../components/TopExperts'
import Banner from '../components/Banner'

const Home = () => {
  return (
    <div>
      <Header/>
      <SpecialityMenu/>
      <TopExperts/>
      <Banner/>
    </div>
  )
}

export default Home
