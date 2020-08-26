import React from 'react'
import PropTypes from 'prop-types'
import styled from '@emotion/styled'
import { StaticQuery, graphql } from 'gatsby'

import Header from './Header'
import './layout.css'

const Content = styled.div`
  margin: 0 auto;
  max-width: 860px;
  padding: 0 1.0875rem 1rem;
  padding-top: 0;
`

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      <>
        <Header siteTitle={data.site.siteMetadata.title} />
        <Content>
          <main>{children}</main>
        </Content>
      </>
    )}
  />
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
