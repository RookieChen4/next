import Head from 'next/head'
import styles from '../layout.module.scss'
import Header from './header'
import Footer from './footer'
import Background from './background'
const name = 'cjh'
export const siteTitle = 'Cjh sanctuary'
export default function Layout({ children, home }) {
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="sanctuary"
        />
        <meta name="og:title" content={siteTitle} />
      </Head>
      <Header home={home}/>
      <main className={styles.main_container}>
        {children}
      </main>
      <Background />
      <Footer />
    </div>
  )
}
