import React from 'react'
import Loader from '../assets/Loader.gif'
import './loading.css'

function Loding() {
  return (
    <div className='loading-container'>
      <img src={Loader} alt="" className='loading-background'/>
      <div class="loader"></div>
    </div>
  )
}

export default Loding
