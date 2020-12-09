import Head from 'next/head'
import Link from 'next/link'
import Layout, { siteTitle } from '../components/Layout/layout'
import utilStyles from '../styles/utils.module.css'
import indexStyles from '../styles/index.module.scss'
import { getSortedPostsData } from '../lib/posts'
import Date from '../components/date'
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'
const DynamicComponentWithNoSSR = dynamic(
  () => import('../components/canvas'),
  // { ssr: false }
)

const Clock = dynamic(
  () => import('../components/clock'),
  // { ssr: false }
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
  return (
    <Layout home={true}>
      <Head>
      </Head>
      <section id="myCanvas" className={indexStyles.myCanvas}>
        <Clock />
        <DynamicComponentWithNoSSR />
      </section>
      <section className={utilStyles.main_container}>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title, face }) => (
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
              <img className={utilStyles.list_image} src={face} />
            </div>
          </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}
