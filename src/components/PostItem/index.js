import React from 'react';
import PropTypes from 'prop-types';
import useTranslations from '../useTranslations';

import * as S from './styled';

const PostItem = ({ slug, date, timeToRead, title, description, image }) => {
  const { toRead } = useTranslations();

  return (
    <S.PostItemLink to={slug}>
      <S.PostItemWrapper>
        {image && <S.PostItemImg fluid={image.childImageSharp.fluid} alt={title} />}
        <S.PostItemInfo>
          <S.PostItemDate>
            {date} • {timeToRead} min {toRead}
          </S.PostItemDate>
          <S.PostItemTitle>{title}</S.PostItemTitle>
          <S.PostItemDescription>{description}</S.PostItemDescription>
        </S.PostItemInfo>
      </S.PostItemWrapper>
    </S.PostItemLink>
  );
};

PostItem.propTypes = {
  slug: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  timeToRead: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default PostItem;
