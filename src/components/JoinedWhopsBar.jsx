// src/components/JoinedWhopsBar.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/joinedWhopsBar.scss';

export default function JoinedWhopsBar() {
  const [joinedWhops, setJoinedWhops] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJoined();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJoined = async () => {
    try {
      const res = await fetch('https://app.byxbot.com/php/get_joined_whops.php', {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Chyba ${res.status}`);
      const data = await res.json();
      setJoinedWhops(data);
    } catch (err) {
      console.error('Chyba při načítání joined whops:', err);
      setJoinedWhops([]);
    }
  };

  if (!joinedWhops.length) {
    return null;
  }

  return (
    <div className="joined-whops-bar">
      {joinedWhops.map((whop) => (
        <div
          key={whop.id}
          className="joined-whop-icon"
          onClick={() => navigate(`/c/${whop.slug}?mode=member`)}
        >
          <img
            src={whop.banner_url}
            alt={`Banner ${whop.slug}`}
            className="joined-whop-img"
          />
        </div>
      ))}
    </div>
  );
}
