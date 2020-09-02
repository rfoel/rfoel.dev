import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { useLocale } from '../hooks/locale'

const query = graphql`
  query useMenu {
    rawData: allFile(filter: { sourceInstanceName: { eq: "menu" } }) {
      edges {
        node {
          name
          translations: childMenuJson {
            menuItems {
              link
              name
            }
          }
        }
      }
    }
  }
`

const useMenu = () => {
  const { locale } = useLocale()
  const { rawData } = useStaticQuery(query)

  const simplified = rawData.edges.map(item => {
    return {
      name: item.node.name,
      menuItems: item.node.translations.menuItems,
    }
  })

  const [{ menuItems }] = simplified.filter(lang => lang.name === locale)

  return menuItems
}

export default useMenu
