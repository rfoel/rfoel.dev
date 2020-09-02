import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { useLocale } from '../hooks/locale'

const query = graphql`
  query useTranslations {
    rawData: allFile(filter: { sourceInstanceName: { eq: "translations" } }) {
      edges {
        node {
          name
          translations: childTranslationsJson {
            home

            hello
            subline
            latestPosts
            allPosts
            toRead

            next
            prev
            of

            button

            aboutProject
            seeMorePWA
            maintainedBy
            contributeMessage
          }
        }
      }
    }
  }
`

const useTranslations = () => {
  const { locale } = useLocale()
  const { rawData } = useStaticQuery(query)

  const simplified = rawData.edges.map(item => {
    return {
      name: item.node.name,
      translations: item.node.translations,
    }
  })

  const [{ translations }] = simplified.filter(lang => lang.name === locale)

  return translations
}

export default useTranslations
