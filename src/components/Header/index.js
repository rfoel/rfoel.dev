import React from 'react';
import useTranslations from '../useTranslations';
import Navigation from '../Navigation';
import Languages from '../Languages';
import ButtonMenu from '../ButtonMenu';

import { useMenu } from '../../hooks/menu';

import * as S from './styled';

const Header = () => {
  const { openedMenu, toggleMenu } = useMenu();

  return (
    <S.HeaderWrapper>
      <S.Container>
        <S.ButtonMenu className={openedMenu ? 'is-active' : ''}>
          <ButtonMenu handleClick={toggleMenu} isActive={openedMenu} />
        </S.ButtonMenu>
        <S.NavMenu className={openedMenu ? 'is-active' : ''}>
          <Navigation />
        </S.NavMenu>
        <S.NavLanguages>
          <Languages />
        </S.NavLanguages>
      </S.Container>
    </S.HeaderWrapper>
  );
};

export default Header;
