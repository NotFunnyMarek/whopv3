// src/components/CardGrid.jsx

import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';
import '../styles/card-grid.scss';

/**
 * CardGrid – vykreslí všechny karty v poli cardsData nadekódované v Card komponentách.
 * Grid se přizpůsobí – standardně 4 sloupce, při menší šířce 3/2/1 sloupec.
 */
const CardGrid = ({ cardsData }) => {
  return (
    <div className="card-grid">
      {cardsData.map((data, idx) => (
        <Card key={idx} {...data} />
      ))}
    </div>
  );
};

CardGrid.propTypes = {
  cardsData: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default CardGrid;
