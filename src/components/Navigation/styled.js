import styled from 'styled-components';
import media from 'styled-media-query';
import LocalizedLink from '../LocalizedLink';
import { Link } from 'gatsby';

export const Navigation = styled.nav`
  display: flex;
  flex-direction: column;
  margin-top: var(--space-sm);
  ${media.greaterThan('medium')`
    flex-direction: row;
    align-items: center;
  `}
`;

export const NavigationLink = styled(LocalizedLink)`
  color: var(--text-dark);
  text-decoration: none;
  position: relative;
  padding: 0 var(--space-sm);
  margin-bottom: var(--space-sm);
  text-align: center;
  ${media.greaterThan('medium')`
    margin-left: var(--space-sm);
    margin-bottom: 0;
  `}
  ${media.greaterThan('large')`
    margin-left: var(--space);
  `}
`;

export const NavigationButton = styled(Link)`
  background: var(--primary-color);
  border-radius: 2px;
  color: #fff;
  display: inline-block;
  padding: var(--space-sm) var(--space);
  text-decoration: none;
  font-weight: bold;
  text-align: center;
  ${media.greaterThan('medium')`
    margin-left: var(--space-lg);
  `}
`;
