import React from 'react'
import { graphql } from 'gatsby'
import TitlePage from '../components/TitlePage'
import SEO from '../components/SEO'

import { Content } from '../components/Content'

const Page = props => {
  const post = props.data.markdownRemark

  return (
    <>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description}
        image={post.frontmatter.image}
      />
      <TitlePage text={post.frontmatter.title} />
      <Content>
        <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
      </Content>
    </>
  )
}

export const query = graphql`
  query Page($locale: String!, $title: String!) {
    markdownRemark(frontmatter: { title: { eq: $title } }, fields: { locale: { eq: $locale } }) {
      frontmatter {
        title
        description
        image {
          childImageSharp {
            fluid(maxWidth: 800) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
      html
    }
  }
`

export default Page
