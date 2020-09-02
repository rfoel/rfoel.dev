import React from 'react'
import { graphql } from 'gatsby'
import Markdown from 'react-markdown'
import TitlePage from '../components/TitlePage'
import SEO from '../components/SEO'

import { Content, Image } from '../components/Content'

const Post = ({ data: { markdownRemark } }) => {
  const {
    frontmatter: { description, image, imageCredit, title },
    html,
  } = markdownRemark

  console.log(imageCredit)

  return (
    <>
      <SEO title={title} description={description} image={image} />
      <TitlePage text={title} />
      {image && <Image fluid={image.childImageSharp.fluid} alt={title} />}
      {imageCredit && <Markdown>{imageCredit}</Markdown>}
      <Content>
        <div dangerouslySetInnerHTML={{ __html: html }}></div>
      </Content>
    </>
  )
}

export const query = graphql`
  query Post($locale: String!, $title: String!) {
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
        imageCredit
      }
      html
    }
  }
`

export default Post
