import Head from 'next/head'
import Link from 'next/link'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import indexStyles from '../styles/index.module.scss'
import { getSortedPostsData } from '../lib/posts'
// import Date from '../components/date'
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'
const DynamicComponentWithNoSSR = dynamic(
  () => import('../components/canvas'),
  { ssr: false }
)

export async function getStaticProps() {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData
    }
  }
}

export default function Home({ allPostsData }) {
  if (process.browser) {
    useEffect(() => {
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
    })
  }
  return (
    <Layout home>
      <Head>
      </Head>
      <section id="myCanvas" className={indexStyles.myCanvas}>
        <div id="clock" className={indexStyles.clock}>
          <div id="hrs"></div>
          <div id="min"></div>
          <div id="sec"> </div>
        </div>
        <DynamicComponentWithNoSSR />
      </section>
      <section className={utilStyles.main_container}>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
            <div className={utilStyles.item_container}>
              <article>
                <Link href={`/post/${id}`}>
                  <a>{title}</a>
                </Link>
                <br />
                <small className={utilStyles.lightText}>
                  <Date dateString={date} />
                </small>
              </article>
              <img className={utilStyles.list_image} src="/images/profile.jpg" />
            </div>
          </li>
          ))}
        </ul>
      </section>
      <style jsx>{`
        active {
          color: blue;
        }
      `}</style>
    </Layout>
  )
}
