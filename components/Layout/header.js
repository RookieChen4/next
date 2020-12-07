import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import styles from '../layout.module.scss'
export default function header({ home }) {
    const [flag, setFlag] = useState(true)
    function changeFlag() {
      setFlag(!flag);
    }
    function scroll() {
      let scrollTop = document.documentElement.scrollTop
      if (scrollTop > 100) {
        setFlag(false);
      } else {
        setFlag(true);
      }
    }
    useEffect(() => {
      if(home) {
        scroll()
        window.addEventListener('scroll', scroll,true)
      }else {
        setFlag(false);
      }
      return function cleanup() {
        window.removeEventListener('scroll', scroll,true)
      };
    })
    return (
      <header>
        <nav onClick={changeFlag} id="nav" className={flag ? styles.nav : styles.nav2}><Link href="/"><a id="Sanctuary">Sanctuary</a></Link></nav>
      </header> 
    )
  }