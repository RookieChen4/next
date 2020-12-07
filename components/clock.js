import React, { useState, useEffect } from 'react';
import indexStyles from '../styles/index.module.scss'
export default function clock() {
    useEffect(() => { 
      createClock()
      return function cleanup() {
      };
    })
    function createClock() {
      function pad(str, max){
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
      }
      const hrs = document.getElementById('hrs')
      const min = document.getElementById('min')
      const sec = document.getElementById('sec')
      function updateClock(){
        var currentTime = new Date ( );
        var currentHours = currentTime.getHours ( );
        var currentMinutes = currentTime.getMinutes ( );
        var currentSeconds = currentTime.getSeconds ( );
  
        hrs.innerHTML = (pad(currentHours, 2));
        min.innerHTML = (pad(currentMinutes, 2));
        sec.innerHTML = (pad(currentSeconds, 2));
      }
      setTimeout(function(){
        document.getElementById('clock').style.opacity = 1;
      }, 1000);
      setInterval(updateClock, 1000);
    }
    
    return (
      <div id="clock" className={indexStyles.clock}>
        <div id="hrs"></div>
        <div id="min"></div>
        <div id="sec"> </div>
      </div>
    )
  }