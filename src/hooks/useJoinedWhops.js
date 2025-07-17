import { useEffect, useState } from 'react';

export default function useJoinedWhops() {
  const [joinedWhops, setJoinedWhops] = useState([]);
  const [loadingWhops, setLoadingWhops] = useState(true);

  useEffect(() => {
    const fetchJoinedWhops = async () => {
      setLoadingWhops(true);
      try {
        const resMembers = await fetch('https://app.byxbot.com/php/get_joined_whops.php', {
          method: 'GET',
          credentials: 'include',
        });
        if (!resMembers.ok) throw new Error(`Members HTTP ${resMembers.status}`);
        const membersJson = await resMembers.json();
        const membersData = Array.isArray(membersJson)
          ? membersJson
          : Array.isArray(membersJson.data)
          ? membersJson.data
          : [];

        const resOwned = await fetch('https://app.byxbot.com/php/get_whop.php?owner=me', {
          method: 'GET',
          credentials: 'include',
        });
        if (!resOwned.ok) throw new Error(`Owned HTTP ${resOwned.status}`);
        const ownedJson = await resOwned.json();
        if (ownedJson.status !== 'success' || !Array.isArray(ownedJson.data)) {
          throw new Error('Failed to load owned Whops');
        }
        const ownedData = ownedJson.data;

        const mapBySlug = new Map();
        membersData.forEach(w => {
          if (w?.slug) {
            mapBySlug.set(w.slug, {
              id: w.whop_id ?? w.id,
              slug: w.slug,
              banner_url: w.banner_url,
              name: w.name ?? w.slug,
            });
          }
        });
        ownedData.forEach(w => {
          if (w?.slug) {
            mapBySlug.set(w.slug, {
              id: w.id,
              slug: w.slug,
              banner_url: w.banner_url,
              name: w.name ?? w.slug,
            });
          }
        });

        setJoinedWhops(Array.from(mapBySlug.values()));
      } catch (err) {
        console.error('Error loading joined/owned Whops:', err);
        setJoinedWhops([]);
      } finally {
        setLoadingWhops(false);
      }
    };

    fetchJoinedWhops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { joinedWhops, loadingWhops };
}
