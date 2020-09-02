import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { useLocale } from '../hooks/locale'

const query = graphql`
  query useLanguageMapping {
    rawData: allFile(filter: { sourceInstanceName: { eq: "language-mapping" } }) {
      edges {
        node {
          name
          translations: childLanguageMappingJson {
            languageMapping {
              en
              pt
            }
          }
        }
      }
    }
  }
`

const useLanguageMapping = () => {
  const { locale } = useLocale()
  const { rawData } = useStaticQuery(query)

  const [languageMapping] = rawData.edges.map(item => {
    return item.node.translations.languageMapping
  })

  return languageMapping
}

export default useLanguageMapping
