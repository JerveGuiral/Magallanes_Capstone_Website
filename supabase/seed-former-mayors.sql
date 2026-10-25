-- ===========================================================================
-- Magallanes LGU — former municipal mayors
--
-- Source: Wikipedia, "Magallanes, Agusan del Norte" — List of mayors (checked
-- 25 Oct 2026). Terms are copied exactly as that list gives them, including its
-- irregular splits (1994 / 1995) and the gaps it leaves (1969–1972 and
-- 1987–1988 are not covered). Confirm with the LGU's records before treating
-- this as official, and correct rows in Admin → Officials.
--
-- Only years are known, so each term is stored as 1 Jan of its first year to
-- 31 Dec of its last; the site and chatbot only ever show the years.
-- One row per term: a mayor who served twice appears twice. is_current = false
-- keeps them off the current-officials listing.
--
-- Former vice mayors and councilors: no public record was found — add them in
-- Admin → Officials (untick "current") when the LGU provides them; the chatbot
-- picks them up automatically.
--
-- Safe to run twice: rows are skipped if the same name + start year exists.
-- ===========================================================================

insert into public.officials (full_name, position, term_start, term_end, is_current, display_order)
select v.full_name, 'Municipal Mayor', make_date(v.from_year, 1, 1), make_date(v.to_year, 12, 31), false, 100 + v.seq
from (values
  (1, 'Florentino P. Magallanes', 1972, 1978),
  (2, 'Francisco M. Herrera',     1978, 1984),
  (3, 'Juanito A. Suacillo',      1984, 1986),
  (4, 'Florentino P. Magallanes', 1986, 1987),
  (5, 'Rosita C. Cumba',          1988, 1994),
  (6, 'Manuel M. Relampagos',     1994, 1994),
  (7, 'Rosita C. Cumba',          1995, 1995),
  (8, 'Manuel M. Relampagos',     1995, 1998),
  (9, 'Cesar C. Cumba, Jr.',      1998, 2007),
  (10, 'Carlito C. Cumba',        2007, 2010),
  (11, 'Demosthenes H. Arabaca',  2010, 2019),
  (12, 'Cesar C. Cumba, Jr.',     2019, 2025)
) as v(seq, full_name, from_year, to_year)
where not exists (
  select 1 from public.officials o
  where o.full_name = v.full_name
    and o.position = 'Municipal Mayor'
    and extract(year from o.term_start) = v.from_year
);

-- Verify
select full_name, extract(year from term_start) as from_year, extract(year from term_end) as to_year, is_current
from public.officials
where position = 'Municipal Mayor'
order by term_start;
