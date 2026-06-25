insert into public.titles (
  slug,
  title,
  type,
  tmdb_id,
  year,
  country,
  network,
  duration,
  rating,
  synopsis,
  poster_path,
  backdrop_path,
  genre_names,
  is_published,
  is_featured,
  is_trending,
  is_recently_added
) values
  ('extraction', 'Extraction', 'movie', 545609, 2020, 'United States', 'Netflix', '1j 57m', '18+', 'Tentara bayaran menjalankan misi penyelamatan berisiko tinggi yang berubah menjadi pertarungan bertahan hidup di tengah kota.', 'Extraction_(2020_film).png', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1800&q=80', array['Action', 'Thriller'], true, false, true, false),
  ('the-gray-man', 'The Gray Man', 'movie', 725201, 2022, 'United States', 'Netflix', '2j 09m', '16+', 'Agen operasi rahasia diburu mantan rekan dan pembunuh bayaran setelah menemukan rahasia berbahaya dari dalam organisasinya.', 'The_Gray_Man_poster.png', 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1800&q=80', array['Action', 'Spy', 'Thriller'], true, false, true, true),
  ('bird-box', 'Bird Box', 'movie', 405774, 2018, 'United States', 'Netflix', '2j 04m', '16+', 'Dalam dunia pasca-bencana, seorang ibu menuntun dua anak melewati perjalanan berbahaya tanpa boleh melihat ancaman di luar.', 'Bird_Box_(film).png', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1800&q=80', array['Horror', 'Sci-Fi', 'Thriller'], true, false, true, false),
  ('dont-look-up', 'Don''t Look Up', 'movie', 646380, 2021, 'United States', 'Netflix', '2j 18m', '16+', 'Dua astronom berusaha memperingatkan publik tentang komet mematikan, tetapi perhatian dunia terpecah oleh politik dan media.', 'Don''t_Look_Up_2021_film.jpg', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1800&q=80', array['Comedy', 'Drama', 'Sci-Fi'], true, false, false, true),
  ('the-irishman', 'The Irishman', 'movie', 398978, 2019, 'United States', 'Netflix', '3j 29m', '18+', 'Seorang veteran dunia kriminal meninjau kembali pilihan hidup, loyalitas, dan konsekuensi panjang dari kekuasaan.', 'The_Irishman_poster.jpg', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1800&q=80', array['Crime', 'Drama'], true, false, false, false),
  ('glass-onion', 'Glass Onion: A Knives Out Mystery', 'movie', 661374, 2022, 'United States', 'Netflix', '2j 19m', '13+', 'Detektif Benoit Blanc menghadiri undangan eksklusif di pulau pribadi yang berubah menjadi teka-teki pembunuhan.', 'Glass_Onion_poster.jpg', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80', array['Comedy', 'Crime', 'Mystery'], true, false, true, false),
  ('the-adam-project', 'The Adam Project', 'movie', 696806, 2022, 'United States', 'Netflix', '1j 46m', '13+', 'Pilot penjelajah waktu bekerja sama dengan dirinya saat masih kecil untuk memperbaiki masa depan keluarganya.', 'The_Adam_Project_poster.png', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1800&q=80', array['Adventure', 'Comedy', 'Sci-Fi'], true, false, false, false),
  ('army-of-the-dead', 'Army of the Dead', 'movie', 503736, 2021, 'United States', 'Netflix', '2j 28m', '18+', 'Sekelompok tentara bayaran memasuki zona zombie Las Vegas untuk melakukan perampokan dengan batas waktu mematikan.', 'Army_of_the_Dead_(2021)_Film_Poster.png', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1800&q=80', array['Action', 'Horror'], true, false, false, false),
  ('enola-holmes', 'Enola Holmes', 'movie', 497582, 2020, 'United Kingdom', 'Netflix', '2j 03m', '13+', 'Adik Sherlock Holmes memulai penyelidikan sendiri ketika ibunya menghilang dan petunjuk membawanya ke konspirasi yang lebih besar.', 'Enola_Holmes_poster.jpeg', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80', array['Adventure', 'Mystery'], true, false, false, true),
  ('the-old-guard', 'The Old Guard', 'movie', 547016, 2020, 'United States', 'Netflix', '2j 05m', '18+', 'Prajurit abadi yang melindungi dunia selama berabad-abad terancam terbongkar saat anggota baru muncul.', 'The_Old_Guard_film_poster.png', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1800&q=80', array['Action', 'Fantasy'], true, false, false, false),
  ('leave-the-world-behind', 'Leave the World Behind', 'movie', 726209, 2023, 'United States', 'Netflix', '2j 21m', '16+', 'Liburan keluarga berubah mencekam ketika gangguan teknologi dan kedatangan dua orang asing menandai krisis yang meluas.', 'Leave_the_World_Behind_film_poster.jpg', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1800&q=80', array['Drama', 'Mystery', 'Thriller'], true, false, true, false),
  ('society-of-the-snow', 'Society of the Snow', 'movie', 906126, 2023, 'Spain', 'Netflix', '2j 24m', '16+', 'Korban kecelakaan pesawat di pegunungan Andes berjuang melawan cuaca ekstrem, rasa takut, dan keputusan sulit.', 'Society_of_the_Snow_poster.jpg', 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1800&q=80', array['Drama', 'Survival'], true, false, false, true),
  ('the-disaster-artist', 'The Disaster Artist', 'movie', 371638, 2017, 'United States', 'A24', '1j 44m', '16+', 'Aktor ambisius Greg Sestero bertemu Tommy Wiseau dan ikut membuat The Room, film kultus yang terkenal karena proses produksinya yang kacau.', 'The_Disaster_Artist_poster.png', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1800&q=80', array['Biography', 'Comedy', 'Drama'], true, false, true, true),
  ('a-bad-moms-christmas', 'A Bad Moms Christmas', 'movie', 431530, 2017, 'United States', 'STXfilms', '1j 44m', '18+', 'Tiga ibu yang kewalahan menghadapi liburan Natal yang makin rumit ketika para ibu mereka sendiri datang membawa ekspektasi dan kekacauan.', 'A_Bad_Moms_Christmas.jpg', 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1800&q=80', array['Comedy'], true, false, false, true),
  ('operation-chromite', 'Operation Chromite', 'movie', 407887, 2016, 'South Korea', 'CJ Entertainment', '1j 51m', '16+', 'Sekelompok pasukan rahasia Korea Selatan menjalankan misi berbahaya yang menjadi kunci operasi pendaratan Incheon dalam Perang Korea.', 'Operation_Chromite_poster.jpg', 'https://images.unsplash.com/photo-1580130545171-8d5b8b2b9b07?auto=format&fit=crop&w=1800&q=80', array['Action', 'Drama', 'War'], true, false, false, true),
  ('squid-game', 'Squid Game', 'series', 93405, 2021, 'South Korea', 'Netflix', '3 Musim', '18+', 'Peserta terlilit utang mengikuti permainan anak-anak dengan hadiah besar dan konsekuensi mematikan.', 'Squid_Game.jpg', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1800&q=80', array['Drama', 'Survival', 'Thriller'], true, false, true, true),
  ('money-heist', 'Money Heist', 'series', 71446, 2017, 'Spain', 'Netflix', '5 Bagian', '18+', 'Sekelompok perampok mengikuti rencana Profesor dalam pencurian besar yang berubah menjadi perang strategi.', 'Money_Heist_Part_5_Volume_2.jpg', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1800&q=80', array['Action', 'Crime', 'Drama'], true, false, true, false),
  ('wednesday', 'Wednesday', 'series', 119051, 2022, 'United States', 'Netflix', '2 Musim', '13+', 'Wednesday Addams menyelidiki misteri pembunuhan di Nevermore Academy sambil mengasah kemampuan psikisnya.', 'Wednesday_Netflix_series_poster.png', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1800&q=80', array['Comedy', 'Fantasy', 'Mystery'], true, false, true, true),
  ('the-boondocks', 'The Boondocks', 'series', 2604, 2005, 'United States', 'Adult Swim', '4 Musim', '18+', 'Dua bersaudara pindah ke pinggiran kota bersama kakek mereka dan menghadapi budaya Amerika modern lewat humor satir yang tajam.', 'The_Boondocks_title_card.png', 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?auto=format&fit=crop&w=1800&q=80', array['Animation', 'Comedy', 'Satire'], true, false, true, true)
on conflict (slug) do update set
  title = excluded.title,
  type = excluded.type,
  tmdb_id = excluded.tmdb_id,
  year = excluded.year,
  country = excluded.country,
  network = excluded.network,
  duration = excluded.duration,
  rating = excluded.rating,
  synopsis = excluded.synopsis,
  poster_path = excluded.poster_path,
  backdrop_path = excluded.backdrop_path,
  genre_names = excluded.genre_names,
  is_published = excluded.is_published,
  is_featured = excluded.is_featured,
  is_trending = excluded.is_trending,
  is_recently_added = excluded.is_recently_added,
  updated_at = now();

insert into public.video_sources (
  title_id,
  label,
  type,
  url,
  quality,
  is_active
)
select
  titles.id,
  'NxSha TMDb/IMDb embed',
  'official_embed',
  case
    when titles.type = 'series' then 'https://web.nxsha.app/embed/tv/' || titles.tmdb_id || '/1/1?sub=id&lang=id'
    else 'https://web.nxsha.app/embed/movie/' || titles.tmdb_id || '?sub=id&lang=id'
  end,
  '1080p',
  true
from public.titles
where titles.tmdb_id is not null
  and titles.slug in (
    'extraction',
    'the-gray-man',
    'bird-box',
    'dont-look-up',
    'the-irishman',
    'glass-onion',
    'the-adam-project',
    'army-of-the-dead',
    'enola-holmes',
    'the-old-guard',
    'leave-the-world-behind',
    'society-of-the-snow',
    'the-disaster-artist',
    'a-bad-moms-christmas',
    'operation-chromite',
    'squid-game',
    'money-heist',
    'wednesday',
    'the-boondocks'
  )
  and not exists (
    select 1
    from public.video_sources
    where video_sources.title_id = titles.id
      and video_sources.label = 'NxSha TMDb/IMDb embed'
  );
