import { getAllPostIds, getPostData } from '../../lib/posts'
import Layout from '../../components/Layout/layout'
import Head from 'next/head'
import utilStyles from '../../styles/utils.module.css'
import postStyles from '../../styles/post.module.scss'
export async function getStaticPaths() {
  const paths = getAllPostIds()
  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id)
  return {
    props: {
      postData
    }
  }
}

export default function Post({ postData }) {
  return (
    <Layout home={false}>
      <Head>
        <meta
          name="description"
          content="sanctuary2"
        />
      </Head>
      <section className={`${utilStyles.main_container} ${postStyles.post_container}`}>
        {postData.title}
        <br />
        {/* {postData.id} */}
        <br />
        {postData.date}
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </section>
    </Layout>
  )
}