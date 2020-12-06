import Head from 'next/head'
import styles from './layout.module.scss'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'

const name = 'Your Name'
export const siteTitle = 'Next.js Sample Website'
import React, { useState, useEffect } from 'react';
export default function Layout({ children, home }) {
  let flag = false
  if(process.browser) {
    flag = true
    let beforeScrollTop = document.documentElement.scrollTop
    function scroll() {
      let afterScrollTop = document.documentElement.scrollTop;
        if (afterScrollTop - beforeScrollTop > 0) {
          document.getElementById('nav').style.background = 'white'
          document.getElementById('Sanctuary').style.color = 'black'
        } else {
          document.getElementById('nav').style.background = 'none'
          document.getElementById('Sanctuary').style.color = 'white'
        }
        if (afterScrollTop <= 50) {
          document.getElementById('nav').style.background = 'none'
          document.getElementById('Sanctuary').style.color = 'white'
        }
        beforeScrollTop = afterScrollTop;
    }
    window.addEventListener('scroll', scroll)
    if(!home) {
      window.removeEventListener('scroll',scroll)
      useEffect(() => {
        document.getElementById('Sanctuary').style.color = 'black'
      })
    }
  }
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="sanctuary "
        />
        <meta
          property="og:image"
          content={`https://og-image.now.sh/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
        {/* <link href="https://fonts.googleapis.com/css2?family=Lobster&display=swap" rel="stylesheet"></link> */}
      </Head>
      <header>
        <nav id="nav" className={home ? styles.nav : styles.nav2}><Link href="/"><a id="Sanctuary">Sanctuary</a></Link></nav>
      </header>
      <main>{children}</main>
      {/* {!home && (
        <div className={styles.backToHome}>
          <Link href="/">
            <a>← Back to home</a>
          </Link>
        </div>
      )} */}
    </div>
  )
}
