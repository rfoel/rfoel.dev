import React from 'react'
import { graphql } from 'gatsby'
import PostItem from '../components/PostItem'
import TitlePage from '../components/TitlePage'
import SEO from '../components/SEO'

import Pagination from '../components/Pagination'

import * as S from '../components/ListWrapper/styled'

const Blog = props => {
  const postList = props.data.allMarkdownRemark.edges

  const { currentPage, numPages } = props.pageContext
  const isFirst = currentPage === 1
  const isLast = currentPage === numPages
  const prevPage = currentPage - 1 === 1 ? '/blog' : `/blog/${currentPage - 1}`
  const nextPage = `/blog/page/${currentPage + 1}`

  return (
    <>
      <SEO title="Blog" />
      <TitlePage text="Blog" />

      <S.ListWrapper>
        {postList.map(
          ({
            node: {
              frontmatter: { date, description, title, image },
              timeToRead,
              fields: { slug },
            },
          }) => (
            <PostItem
              slug={`/blog/${slug}`}
              date={date}
              timeToRead={timeToRead}
              title={title}
              description={description}
              image={image}
              key={slug}
            />
          ),
        )}
      </S.ListWrapper>

      <Pagination
        isFirst={isFirst}
        isLast={isLast}
        currentPage={currentPage}
        numPages={numPages}
        prevPage={prevPage}
        nextPage={nextPage}
      />
    </>
  )
}

export const query = graphql`
  query PostsList($locale: String!, $dateFormat: String!, $skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      sort: {fields: frontmatter___date, order: DESC}, 
      filter: { 
        fields: { locale: { eq: $locale } } 
        fileAbsolutePath: {regex: "/(blog)\/.*\\.md$/"}
      }
      limit: $limit
      skip: $skip
    ){
      edges {
        node {
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
            date(formatString: $dateFormat)

          }
          timeToRead
          fields {
            locale
            slug
          }
        }
      }
    }
  }
`

export default Blog
