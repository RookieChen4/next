import '../styles/global.css'
import styles from '../styles/utils.module.css'
import React, { useState } from 'react';
import Router from 'next/router';
import NProgress from 'nprogress'; //nprogress module
import 'nprogress/nprogress.css'; //styles of nprogress
export default function App({ Component, pageProps }) {
  const [flag, setFlag] = useState(false)
  //Binding events. 
  Router.events.on('routeChangeStart', () => {
    setFlag(true);
    NProgress.start()
  }); 
  Router.events.on('routeChangeComplete', () => {
    setFlag(false);
    NProgress.done()
  }); 
  Router.events.on('routeChangeError', () => {
    setFlag(false);
    NProgress.done()
  });
  return (
    <>
      {/* {flag ? (<div className={styles.loadingContainer}></div>) : (<></>)} */}
      <Component {...pageProps} />
    </>
  )
}