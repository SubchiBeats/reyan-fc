/* Reyan FC — player database (2025-26 era, FC-style ratings)
 * Stats: pace, shooting, passing, dribbling, defending, physical.
 * For GKs the six values are read as DIV, HAN, KIC, REF, SPD, POS.
 * Ratings & clubs reflect the 2025-26 season as closely as practical.
 */
window.RFC = window.RFC || {};

(function (RFC) {
  'use strict';

  // stable id derived from the name → saves survive roster edits/reordering
  function slug(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  // Heroes get tied to a historical club for chemistry purposes (FC26 rule).
  const HERO_CLUB = {
    'david-villa': 'Valencia',
    'robin-van-persie': 'Arsenal',
    'yaya-toure': 'Manchester City',
    'carlos-tevez': 'Manchester City',
  };
  // m = make player
  function m(name, rating, pos, alt, club, league, nation, pa, sh, ps, dr, de, ph, special) {
    const id = slug(name);
    return {
      id, name, rating,
      pos,                       // primary position
      alt: alt || [],            // alternate positions
      club, league, nation,
      pace: pa, shooting: sh, passing: ps, dribbling: dr, defending: de, physical: ph,
      special: special || null,  // icon|hero|toty|totw|null
      heroClub: special === 'hero' ? (HERO_CLUB[id] || null) : null,
    };
  }

  const P = [
    /* ===================== ICONS ===================== */
    m('Pelé', 98, 'CAM', ['ST', 'CF'], 'Icons', 'Icons', 'Brazil', 95, 96, 93, 96, 60, 76, 'icon'),
    m('Diego Maradona', 97, 'CAM', ['CF', 'ST'], 'Icons', 'Icons', 'Argentina', 92, 91, 92, 98, 48, 75, 'icon'),
    m('Johan Cruyff', 96, 'CF', ['CAM', 'ST'], 'Icons', 'Icons', 'Netherlands', 93, 92, 93, 95, 58, 74, 'icon'),
    m('Ronaldo Nazário', 96, 'ST', ['CF'], 'Icons', 'Icons', 'Brazil', 97, 96, 81, 95, 45, 81, 'icon'),
    m('Zinedine Zidane', 96, 'CAM', ['CM'], 'Icons', 'Icons', 'France', 81, 86, 93, 96, 67, 84, 'icon'),
    m('Ronaldinho', 95, 'CAM', ['LW', 'CF'], 'Icons', 'Icons', 'Brazil', 90, 88, 91, 97, 42, 78, 'icon'),
    m('Thierry Henry', 95, 'ST', ['LW'], 'Icons', 'Icons', 'France', 96, 93, 82, 92, 53, 81, 'icon'),
    m('Franz Beckenbauer', 94, 'CB', ['CDM'], 'Icons', 'Icons', 'Germany', 80, 70, 88, 84, 92, 86, 'icon'),
    m('Paolo Maldini', 94, 'CB', ['LB'], 'Icons', 'Icons', 'Italy', 84, 56, 80, 81, 94, 89, 'icon'),
    m('Steven Gerrard', 92, 'CM', ['CDM', 'CAM'], 'Icons', 'Icons', 'England', 81, 88, 90, 85, 78, 86, 'icon'),
    m('Patrick Vieira', 91, 'CDM', ['CM'], 'Icons', 'Icons', 'France', 80, 73, 83, 84, 88, 92, 'icon'),
    m('George Best', 92, 'RW', ['LW', 'CF'], 'Icons', 'Icons', 'Northern Ireland', 92, 86, 81, 95, 47, 73, 'icon'),

    /* ===================== HEROES ===================== */
    m('David Villa', 89, 'ST', ['LW'], 'Icons', 'Icons', 'Spain', 87, 89, 78, 86, 41, 73, 'hero'),
    m('Robin van Persie', 88, 'ST', ['CF'], 'Icons', 'Icons', 'Netherlands', 80, 90, 80, 85, 42, 78, 'hero'),
    m('Yaya Touré', 88, 'CM', ['CDM'], 'Icons', 'Icons', 'Ivory Coast', 76, 84, 84, 83, 78, 90, 'hero'),
    m('Carlos Tevez', 87, 'ST', ['CF', 'CAM'], 'Icons', 'Icons', 'Argentina', 83, 87, 79, 86, 56, 82, 'hero'),

    /* ===================== REAL MADRID ===================== */
    m('Kylian Mbappé', 91, 'ST', ['LW'], 'Real Madrid', 'La Liga', 'France', 97, 90, 80, 92, 36, 78),
    m('Jude Bellingham', 90, 'CAM', ['CM'], 'Real Madrid', 'La Liga', 'England', 82, 85, 86, 88, 78, 88),
    m('Vinícius Jr', 90, 'LW', ['ST'], 'Real Madrid', 'La Liga', 'Brazil', 95, 84, 78, 92, 29, 68),
    m('Thibaut Courtois', 89, 'GK', [], 'Real Madrid', 'La Liga', 'Belgium', 50, 87, 78, 89, 90, 91),
    m('Aurélien Tchouaméni', 86, 'CDM', ['CB'], 'Real Madrid', 'La Liga', 'France', 75, 70, 82, 80, 85, 87),
    m('Rodrygo', 86, 'RW', ['LW', 'ST'], 'Real Madrid', 'La Liga', 'Brazil', 91, 82, 80, 88, 35, 66),
    m('Federico Valverde', 89, 'CM', ['RM', 'CDM'], 'Real Madrid', 'La Liga', 'Uruguay', 88, 85, 86, 85, 80, 86),
    m('Antonio Rüdiger', 86, 'CB', [], 'Real Madrid', 'La Liga', 'Germany', 82, 42, 70, 70, 87, 88),
    m('Eduardo Camavinga', 85, 'CM', ['CDM', 'LB'], 'Real Madrid', 'La Liga', 'France', 84, 65, 80, 86, 80, 80),
    m('Arda Güler', 84, 'CAM', ['RW', 'CM'], 'Real Madrid', 'La Liga', 'Turkey', 78, 80, 85, 87, 55, 62),
    m('Dani Carvajal', 85, 'RB', ['RWB'], 'Real Madrid', 'La Liga', 'Spain', 80, 65, 80, 80, 84, 80),
    m('Trent Alexander-Arnold', 86, 'RB', ['RWB', 'CM'], 'Real Madrid', 'La Liga', 'England', 76, 72, 89, 80, 78, 73),

    /* ===================== BARCELONA ===================== */
    m('Lamine Yamal', 89, 'RW', ['CAM'], 'Barcelona', 'La Liga', 'Spain', 90, 82, 84, 92, 35, 64),
    m('Robert Lewandowski', 88, 'ST', ['CF'], 'Barcelona', 'La Liga', 'Poland', 75, 90, 79, 84, 44, 82),
    m('Pedri', 88, 'CM', ['CAM'], 'Barcelona', 'La Liga', 'Spain', 80, 75, 88, 90, 70, 68),
    m('Raphinha', 87, 'LW', ['RW'], 'Barcelona', 'La Liga', 'Brazil', 88, 84, 83, 86, 44, 70),
    m('Gavi', 84, 'CM', ['CAM'], 'Barcelona', 'La Liga', 'Spain', 81, 70, 82, 85, 72, 73),
    m('Frenkie de Jong', 87, 'CM', ['CDM'], 'Barcelona', 'La Liga', 'Netherlands', 78, 73, 87, 89, 76, 80),
    m('Marc-André ter Stegen', 87, 'GK', [], 'Barcelona', 'La Liga', 'Germany', 47, 86, 88, 88, 88, 85),
    m('Pau Cubarsí', 83, 'CB', [], 'Barcelona', 'La Liga', 'Spain', 78, 35, 72, 72, 84, 78),
    m('Jules Koundé', 85, 'RB', ['CB'], 'Barcelona', 'La Liga', 'France', 86, 50, 75, 78, 85, 80),
    m('Ronald Araújo', 85, 'CB', ['RB'], 'Barcelona', 'La Liga', 'Uruguay', 85, 45, 68, 72, 86, 88),
    m('Dani Olmo', 85, 'CAM', ['LW'], 'Barcelona', 'La Liga', 'Spain', 80, 80, 84, 87, 55, 68),
    m('Marcus Rashford', 84, 'LW', ['ST'], 'Barcelona', 'La Liga', 'England', 90, 82, 75, 84, 42, 78),

    /* ===================== MANCHESTER CITY ===================== */
    m('Erling Haaland', 91, 'ST', [], 'Manchester City', 'Premier League', 'Norway', 89, 93, 68, 81, 45, 88),
    m('Rodri', 90, 'CDM', ['CM'], 'Manchester City', 'Premier League', 'Spain', 70, 78, 87, 84, 88, 87),
    m('Phil Foden', 87, 'CAM', ['RW', 'LW'], 'Manchester City', 'Premier League', 'England', 82, 82, 86, 90, 62, 68),
    m('Bernardo Silva', 87, 'CM', ['RW', 'CAM'], 'Manchester City', 'Premier League', 'Portugal', 78, 78, 86, 90, 66, 66),
    m('Rúben Dias', 88, 'CB', [], 'Manchester City', 'Premier League', 'Portugal', 70, 42, 72, 73, 89, 88),
    m('Joško Gvardiol', 86, 'CB', ['LB'], 'Manchester City', 'Premier League', 'Croatia', 84, 52, 72, 78, 85, 84),
    m('Gianluigi Donnarumma', 89, 'GK', [], 'Manchester City', 'Premier League', 'Italy', 52, 88, 78, 89, 88, 89),
    m('Mateo Kovačić', 84, 'CM', ['CDM'], 'Manchester City', 'Premier League', 'Croatia', 70, 74, 85, 84, 78, 80),
    m('Savinho', 82, 'RW', ['LW'], 'Manchester City', 'Premier League', 'Brazil', 90, 74, 78, 87, 38, 60),
    m('Nathan Aké', 82, 'CB', ['LB'], 'Manchester City', 'Premier League', 'Netherlands', 80, 45, 72, 76, 83, 82),
    m('Omar Marmoush', 84, 'ST', ['LW', 'CAM'], 'Manchester City', 'Premier League', 'Egypt', 89, 83, 78, 84, 45, 76),
    m('Tijjani Reijnders', 85, 'CM', ['CDM'], 'Manchester City', 'Premier League', 'Netherlands', 80, 78, 84, 84, 72, 76),

    /* ===================== LIVERPOOL ===================== */
    m('Mohamed Salah', 90, 'RW', ['ST'], 'Liverpool', 'Premier League', 'Egypt', 90, 89, 82, 89, 45, 75),
    m('Virgil van Dijk', 89, 'CB', [], 'Liverpool', 'Premier League', 'Netherlands', 80, 60, 74, 76, 90, 92),
    m('Florian Wirtz', 89, 'CAM', ['CM', 'LW'], 'Liverpool', 'Premier League', 'Germany', 82, 82, 88, 91, 58, 66),
    m('Alexander Isak', 87, 'ST', [], 'Liverpool', 'Premier League', 'Sweden', 86, 86, 76, 87, 40, 78),
    m('Ryan Gravenberch', 85, 'CDM', ['CM'], 'Liverpool', 'Premier League', 'Netherlands', 80, 70, 82, 86, 80, 84),
    m('Dominik Szoboszlai', 85, 'CM', ['CAM', 'RB'], 'Liverpool', 'Premier League', 'Hungary', 82, 82, 85, 84, 68, 80),
    m('Alisson', 89, 'GK', [], 'Liverpool', 'Premier League', 'Brazil', 54, 88, 85, 89, 90, 88),
    m('Ibrahima Konaté', 85, 'CB', [], 'Liverpool', 'Premier League', 'France', 84, 40, 66, 72, 84, 87),
    m('Cody Gakpo', 84, 'LW', ['ST'], 'Liverpool', 'Premier League', 'Netherlands', 84, 82, 78, 85, 45, 80),
    m('Hugo Ekitike', 83, 'ST', ['CF'], 'Liverpool', 'Premier League', 'France', 86, 82, 72, 84, 38, 76),
    m('Conor Bradley', 79, 'RB', ['RWB'], 'Liverpool', 'Premier League', 'Northern Ireland', 86, 60, 72, 76, 76, 74),

    /* ===================== ARSENAL ===================== */
    m('Bukayo Saka', 88, 'RW', ['RM'], 'Arsenal', 'Premier League', 'England', 86, 84, 84, 89, 56, 72),
    m('Martin Ødegaard', 88, 'CAM', ['CM'], 'Arsenal', 'Premier League', 'Norway', 78, 82, 89, 89, 60, 64),
    m('Declan Rice', 88, 'CDM', ['CM'], 'Arsenal', 'Premier League', 'England', 78, 75, 82, 80, 86, 88),
    m('William Saliba', 87, 'CB', [], 'Arsenal', 'Premier League', 'France', 85, 42, 72, 78, 87, 86),
    m('Viktor Gyökeres', 86, 'ST', [], 'Arsenal', 'Premier League', 'Sweden', 88, 87, 72, 82, 42, 86),
    m('Gabriel Magalhães', 86, 'CB', [], 'Arsenal', 'Premier League', 'Brazil', 78, 45, 68, 72, 87, 88),
    m('Martin Zubimendi', 85, 'CDM', ['CM'], 'Arsenal', 'Premier League', 'Spain', 70, 66, 84, 80, 84, 80),
    m('David Raya', 86, 'GK', [], 'Arsenal', 'Premier League', 'Spain', 48, 84, 84, 86, 87, 84),
    m('Gabriel Martinelli', 83, 'LW', ['ST'], 'Arsenal', 'Premier League', 'Brazil', 92, 78, 75, 84, 42, 72),
    m('Kai Havertz', 84, 'ST', ['CAM'], 'Arsenal', 'Premier League', 'Germany', 78, 80, 80, 82, 56, 84),
    m('Jurriën Timber', 84, 'RB', ['CB'], 'Arsenal', 'Premier League', 'Netherlands', 84, 50, 76, 80, 85, 80),

    /* ===================== CHELSEA ===================== */
    m('Cole Palmer', 87, 'CAM', ['RW'], 'Chelsea', 'Premier League', 'England', 80, 84, 85, 88, 55, 72),
    m('Moisés Caicedo', 86, 'CDM', ['CM'], 'Chelsea', 'Premier League', 'Ecuador', 82, 70, 80, 82, 85, 86),
    m('Enzo Fernández', 85, 'CM', ['CAM'], 'Chelsea', 'Premier League', 'Argentina', 75, 78, 86, 83, 76, 78),
    m('Robert Sánchez', 82, 'GK', [], 'Chelsea', 'Premier League', 'Spain', 46, 80, 78, 82, 84, 86),
    m('Levi Colwill', 82, 'CB', ['LB'], 'Chelsea', 'Premier League', 'England', 78, 40, 72, 76, 82, 80),
    m('Nicolas Jackson', 81, 'ST', [], 'Chelsea', 'Premier League', 'Senegal', 88, 79, 70, 80, 38, 78),
    m('Pedro Neto', 82, 'RW', ['LW'], 'Chelsea', 'Premier League', 'Portugal', 90, 76, 78, 86, 44, 66),
    m('Reece James', 84, 'RB', ['RWB', 'CDM'], 'Chelsea', 'Premier League', 'England', 82, 70, 82, 82, 83, 84),
    m('João Pedro', 82, 'ST', ['CF', 'CAM'], 'Chelsea', 'Premier League', 'Brazil', 80, 80, 78, 84, 45, 74),

    /* ===================== MANCHESTER UNITED ===================== */
    m('Bruno Fernandes', 87, 'CAM', ['CM'], 'Manchester United', 'Premier League', 'Portugal', 76, 86, 88, 84, 68, 78),
    m('Matthijs de Ligt', 84, 'CB', [], 'Manchester United', 'Premier League', 'Netherlands', 76, 45, 72, 72, 85, 86),
    m('Bryan Mbeumo', 83, 'RW', ['ST'], 'Manchester United', 'Premier League', 'Cameroon', 88, 80, 76, 84, 48, 72),
    m('Matheus Cunha', 83, 'ST', ['CAM', 'LW'], 'Manchester United', 'Premier League', 'Brazil', 84, 80, 78, 86, 48, 76),
    m('Casemiro', 84, 'CDM', [], 'Manchester United', 'Premier League', 'Brazil', 64, 74, 78, 75, 85, 88),
    m('André Onana', 82, 'GK', [], 'Manchester United', 'Premier League', 'Cameroon', 52, 80, 82, 83, 82, 82),
    m('Leny Yoro', 81, 'CB', [], 'Manchester United', 'Premier League', 'France', 82, 38, 68, 72, 82, 80),
    m('Amad Diallo', 81, 'RW', ['RM', 'RWB'], 'Manchester United', 'Premier League', 'Ivory Coast', 86, 76, 78, 86, 50, 64),

    /* ===================== TOTTENHAM ===================== */
    m('James Maddison', 84, 'CAM', ['CM'], 'Tottenham', 'Premier League', 'England', 76, 80, 86, 86, 58, 66),
    m('Cristian Romero', 86, 'CB', [], 'Tottenham', 'Premier League', 'Argentina', 80, 45, 70, 74, 87, 86),
    m('Dejan Kulusevski', 84, 'RW', ['CAM', 'CM'], 'Tottenham', 'Premier League', 'Sweden', 82, 78, 82, 85, 60, 80),
    m('Micky van de Ven', 83, 'CB', [], 'Tottenham', 'Premier League', 'Netherlands', 92, 42, 68, 74, 83, 82),
    m('Guglielmo Vicario', 83, 'GK', [], 'Tottenham', 'Premier League', 'Italy', 47, 82, 76, 84, 84, 82),
    m('Son Heung-min', 86, 'LW', ['ST'], 'LAFC', 'MLS', 'South Korea', 86, 87, 82, 86, 42, 70),

    /* ===================== NEWCASTLE / VILLA ===================== */
    m('Joelinton', 82, 'CM', ['CDM', 'ST'], 'Newcastle', 'Premier League', 'Brazil', 78, 76, 76, 80, 78, 88),
    m('Bruno Guimarães', 86, 'CM', ['CDM'], 'Newcastle', 'Premier League', 'Brazil', 76, 76, 85, 84, 82, 82),
    m('Anthony Gordon', 83, 'LW', ['ST'], 'Newcastle', 'Premier League', 'England', 92, 78, 76, 84, 48, 70),
    m('Nick Pope', 82, 'GK', [], 'Newcastle', 'Premier League', 'England', 44, 80, 72, 82, 85, 86),
    m('Sandro Tonali', 84, 'CM', ['CDM'], 'Newcastle', 'Premier League', 'Italy', 74, 76, 84, 82, 80, 82),
    m('Ollie Watkins', 84, 'ST', [], 'Aston Villa', 'Premier League', 'England', 87, 83, 74, 82, 45, 80),
    m('Emiliano Martínez', 85, 'GK', [], 'Aston Villa', 'Premier League', 'Argentina', 49, 84, 80, 85, 86, 87),
    m('Morgan Rogers', 81, 'CAM', ['LW', 'ST'], 'Aston Villa', 'Premier League', 'England', 83, 76, 78, 84, 52, 78),

    /* ===================== BAYERN MUNICH ===================== */
    m('Harry Kane', 90, 'ST', ['CF'], 'Bayern Munich', 'Bundesliga', 'England', 70, 92, 84, 82, 48, 84),
    m('Jamal Musiala', 88, 'CAM', ['LW', 'CM'], 'Bayern Munich', 'Bundesliga', 'Germany', 86, 80, 84, 93, 50, 68),
    m('Joshua Kimmich', 88, 'CM', ['CDM', 'RB'], 'Bayern Munich', 'Bundesliga', 'Germany', 74, 76, 88, 84, 82, 80),
    m('Michael Olise', 87, 'RW', ['CAM'], 'Bayern Munich', 'Bundesliga', 'France', 84, 82, 86, 89, 48, 64),
    m('Alphonso Davies', 85, 'LB', ['LWB', 'LM'], 'Bayern Munich', 'Bundesliga', 'Canada', 95, 68, 78, 86, 80, 80),
    m('Manuel Neuer', 87, 'GK', [], 'Bayern Munich', 'Bundesliga', 'Germany', 58, 86, 90, 86, 88, 85),
    m('Dayot Upamecano', 85, 'CB', [], 'Bayern Munich', 'Bundesliga', 'France', 86, 42, 70, 75, 85, 88),
    m('Serge Gnabry', 83, 'RW', ['LW', 'ST'], 'Bayern Munich', 'Bundesliga', 'Germany', 86, 82, 80, 85, 44, 72),
    m('Konrad Laimer', 81, 'CM', ['RB', 'CDM'], 'Bayern Munich', 'Bundesliga', 'Austria', 84, 70, 78, 80, 80, 82),

    /* ===================== LEVERKUSEN / DORTMUND / LEIPZIG ===================== */
    m('Granit Xhaka', 84, 'CM', ['CDM'], 'Bayer Leverkusen', 'Bundesliga', 'Switzerland', 64, 76, 86, 80, 80, 82),
    m('Jeremie Frimpong', 82, 'RB', ['RWB', 'RM'], 'Liverpool', 'Premier League', 'Netherlands', 94, 72, 76, 84, 74, 72),
    m('Alejandro Grimaldo', 85, 'LB', ['LWB', 'LM'], 'Bayer Leverkusen', 'Bundesliga', 'Spain', 82, 76, 85, 84, 78, 74),
    m('Patrik Schick', 83, 'ST', [], 'Bayer Leverkusen', 'Bundesliga', 'Czechia', 78, 85, 72, 78, 40, 82),
    m('Karim Adeyemi', 82, 'LW', ['ST'], 'Borussia Dortmund', 'Bundesliga', 'Germany', 95, 78, 72, 84, 40, 68),
    m('Julian Brandt', 84, 'CAM', ['LW', 'CM'], 'Borussia Dortmund', 'Bundesliga', 'Germany', 78, 78, 85, 86, 56, 66),
    m('Serhou Guirassy', 85, 'ST', [], 'Borussia Dortmund', 'Bundesliga', 'Guinea', 82, 86, 70, 80, 42, 84),
    m('Gregor Kobel', 84, 'GK', [], 'Borussia Dortmund', 'Bundesliga', 'Switzerland', 50, 82, 74, 85, 85, 84),
    m('Benjamin Šeško', 84, 'ST', [], 'Manchester United', 'Premier League', 'Slovenia', 84, 84, 68, 80, 40, 84),
    m('Xavi Simons', 84, 'CAM', ['RW', 'CM'], 'Tottenham', 'Premier League', 'Netherlands', 82, 78, 84, 88, 52, 62),
    m('Loïs Openda', 83, 'ST', ['LW'], 'RB Leipzig', 'Bundesliga', 'Belgium', 92, 82, 72, 82, 42, 74),

    /* ===================== PARIS SG ===================== */
    m('Ousmane Dembélé', 89, 'RW', ['LW', 'ST'], 'Paris SG', 'Ligue 1', 'France', 92, 84, 82, 91, 40, 66),
    m('Vitinha', 87, 'CM', ['CDM'], 'Paris SG', 'Ligue 1', 'Portugal', 80, 78, 87, 88, 76, 72),
    m('Nuno Mendes', 85, 'LB', ['LWB'], 'Paris SG', 'Ligue 1', 'Portugal', 90, 60, 78, 84, 82, 80),
    m('João Neves', 85, 'CM', ['CDM'], 'Paris SG', 'Ligue 1', 'Portugal', 80, 72, 84, 86, 80, 74),
    m('Désiré Doué', 84, 'CAM', ['RW', 'LW'], 'Paris SG', 'Ligue 1', 'France', 86, 78, 82, 88, 50, 66),
    m('Khvicha Kvaratskhelia', 87, 'LW', [], 'Paris SG', 'Ligue 1', 'Georgia', 86, 80, 82, 90, 42, 72),
    m('Marquinhos', 86, 'CB', ['CDM'], 'Paris SG', 'Ligue 1', 'Brazil', 80, 50, 76, 78, 87, 82),
    m('Gonçalo Ramos', 83, 'ST', ['CF'], 'Paris SG', 'Ligue 1', 'Portugal', 82, 84, 72, 80, 42, 82),
    m('Achraf Hakimi', 86, 'RB', ['RWB'], 'Paris SG', 'Ligue 1', 'Morocco', 94, 72, 80, 85, 78, 76),
    m('Bradley Barcola', 84, 'LW', ['RW', 'ST'], 'Paris SG', 'Ligue 1', 'France', 92, 78, 78, 86, 40, 64),
    m('Fabián Ruiz', 84, 'CM', ['CAM'], 'Paris SG', 'Ligue 1', 'Spain', 72, 78, 85, 84, 72, 80),

    /* ===================== SERIE A ===================== */
    m('Lautaro Martínez', 88, 'ST', ['CF'], 'Inter', 'Serie A', 'Argentina', 84, 88, 78, 85, 48, 82),
    m('Nicolò Barella', 87, 'CM', ['CDM'], 'Inter', 'Serie A', 'Italy', 80, 78, 85, 84, 80, 82),
    m('Alessandro Bastoni', 86, 'CB', ['LB'], 'Inter', 'Serie A', 'Italy', 78, 45, 78, 78, 86, 82),
    m('Federico Dimarco', 85, 'LB', ['LWB'], 'Inter', 'Serie A', 'Italy', 82, 70, 84, 82, 80, 74),
    m('Marcus Thuram', 85, 'ST', ['LW'], 'Inter', 'Serie A', 'France', 86, 82, 74, 82, 44, 86),
    m('Rafael Leão', 86, 'LW', ['ST'], 'AC Milan', 'Serie A', 'Portugal', 93, 82, 76, 88, 36, 78),
    m('Christian Pulisic', 85, 'RW', ['CAM', 'LW'], 'AC Milan', 'Serie A', 'USA', 86, 80, 82, 86, 48, 64),
    m('Mike Maignan', 87, 'GK', [], 'AC Milan', 'Serie A', 'France', 56, 86, 82, 87, 88, 84),
    m('Luka Modrić', 84, 'CM', ['CAM'], 'AC Milan', 'Serie A', 'Croatia', 72, 76, 88, 86, 70, 66),
    m('Khéphren Thuram', 83, 'CM', ['CDM'], 'Juventus', 'Serie A', 'France', 80, 70, 80, 82, 78, 86),
    m('Kenan Yıldız', 83, 'LW', ['CAM', 'ST'], 'Juventus', 'Serie A', 'Turkey', 84, 78, 80, 87, 44, 68),
    m('Dušan Vlahović', 84, 'ST', [], 'Juventus', 'Serie A', 'Serbia', 80, 85, 70, 80, 42, 84),
    m('Federico Gatti', 81, 'CB', [], 'Juventus', 'Serie A', 'Italy', 76, 42, 64, 68, 82, 84),
    m('Kevin De Bruyne', 88, 'CM', ['CAM'], 'Napoli', 'Serie A', 'Belgium', 72, 86, 91, 86, 64, 78),
    m('Scott McTominay', 84, 'CM', ['CAM', 'CDM'], 'Napoli', 'Serie A', 'Scotland', 76, 80, 78, 80, 78, 86),
    m('Romelu Lukaku', 84, 'ST', [], 'Napoli', 'Serie A', 'Belgium', 82, 85, 72, 78, 42, 90),
    m('Alessandro Buongiorno', 83, 'CB', [], 'Napoli', 'Serie A', 'Italy', 78, 40, 66, 70, 84, 84),

    /* ===================== LA LIGA (others) ===================== */
    m('Antoine Griezmann', 86, 'CF', ['ST', 'CAM'], 'Atletico Madrid', 'La Liga', 'France', 78, 84, 86, 86, 56, 72),
    m('Julián Álvarez', 87, 'ST', ['CF', 'CAM'], 'Atletico Madrid', 'La Liga', 'Argentina', 84, 85, 82, 86, 58, 78),
    m('Jan Oblak', 87, 'GK', [], 'Atletico Madrid', 'La Liga', 'Slovenia', 48, 86, 76, 87, 88, 84),
    m('Robin Le Normand', 83, 'CB', [], 'Atletico Madrid', 'La Liga', 'Spain', 76, 40, 70, 72, 84, 82),
    m('Nico Williams', 85, 'LW', ['RW'], 'Atletico Madrid', 'La Liga', 'Spain', 93, 78, 78, 87, 44, 68),
    m('Álex Baena', 82, 'CAM', ['LW', 'CM'], 'Atletico Madrid', 'La Liga', 'Spain', 78, 76, 84, 84, 56, 68),
    m('Mikel Oyarzabal', 84, 'ST', ['LW', 'CF'], 'Real Sociedad', 'La Liga', 'Spain', 80, 82, 80, 84, 52, 76),
    m('Iñaki Williams', 82, 'ST', ['RW'], 'Athletic Club', 'La Liga', 'Ghana', 92, 78, 72, 82, 44, 80),
    m('Isco', 83, 'CAM', ['CM'], 'Real Betis', 'La Liga', 'Spain', 70, 78, 86, 86, 56, 66),

    /* ===================== SAUDI / TURKEY / OTHERS ===================== */
    m('Cristiano Ronaldo', 86, 'ST', ['LW'], 'Al Nassr', 'Saudi Pro League', 'Portugal', 80, 90, 76, 80, 36, 78),
    m('Sadio Mané', 82, 'LW', ['ST'], 'Al Nassr', 'Saudi Pro League', 'Senegal', 85, 82, 78, 84, 44, 76),
    m('Karim Benzema', 85, 'CF', ['ST'], 'Al Ittihad', 'Saudi Pro League', 'France', 76, 86, 83, 85, 42, 76),
    m('N\'Golo Kanté', 83, 'CDM', ['CM'], 'Al Ittihad', 'Saudi Pro League', 'France', 78, 66, 78, 82, 86, 82),
    m('Riyad Mahrez', 83, 'RW', [], 'Al Ahli', 'Saudi Pro League', 'Algeria', 78, 80, 82, 88, 40, 60),
    m('Rúben Neves', 83, 'CDM', ['CM'], 'Al Hilal', 'Saudi Pro League', 'Portugal', 66, 76, 85, 78, 80, 80),
    m('Aleksandar Mitrović', 81, 'ST', [], 'Al Hilal', 'Saudi Pro League', 'Serbia', 72, 84, 68, 74, 42, 88),
    m('Victor Osimhen', 87, 'ST', [], 'Galatasaray', 'Süper Lig', 'Nigeria', 90, 87, 70, 82, 44, 84),
    m('Mauro Icardi', 80, 'ST', [], 'Galatasaray', 'Süper Lig', 'Argentina', 76, 84, 68, 78, 38, 78),

    /* ===================== PORTUGAL / EREDIVISIE ===================== */
    m('Pedro Gonçalves', 83, 'CAM', ['RW'], 'Sporting CP', 'Primeira Liga', 'Portugal', 82, 82, 82, 85, 52, 68),
    m('Ángel Di María', 82, 'RW', ['LW', 'CAM'], 'Benfica', 'Primeira Liga', 'Argentina', 80, 80, 85, 85, 50, 64),
    m('Vangelis Pavlidis', 81, 'ST', [], 'Benfica', 'Primeira Liga', 'Greece', 80, 82, 74, 80, 42, 78),
    m('Luuk de Jong', 78, 'ST', [], 'PSV', 'Eredivisie', 'Netherlands', 64, 80, 72, 72, 44, 84),
    m('Jorrel Hato', 79, 'CB', ['LB'], 'Chelsea', 'Premier League', 'Netherlands', 82, 40, 72, 76, 80, 76),

    /* ===================== MORE NATIONS / DEPTH (silvers/bronzes) ===================== */
    m('Wojciech Szczęsny', 81, 'GK', [], 'Barcelona', 'La Liga', 'Poland', 46, 80, 70, 82, 82, 82),
    m('Yann Sommer', 84, 'GK', [], 'Inter', 'Serie A', 'Switzerland', 52, 82, 78, 86, 84, 78),
    m('Marc Cucurella', 83, 'LB', ['LWB'], 'Chelsea', 'Premier League', 'Spain', 84, 55, 78, 82, 82, 76),
    m('Pervis Estupiñán', 82, 'LB', ['LWB'], 'AC Milan', 'Serie A', 'Ecuador', 86, 60, 76, 80, 80, 78),
    m('Wilfred Ndidi', 80, 'CDM', ['CM'], 'Besiktas', 'Süper Lig', 'Nigeria', 76, 66, 74, 76, 82, 84),
    m('Takefusa Kubo', 82, 'RW', ['CAM'], 'Real Sociedad', 'La Liga', 'Japan', 84, 76, 80, 87, 48, 60),
    m('Kaoru Mitoma', 82, 'LW', [], 'Brighton', 'Premier League', 'Japan', 88, 76, 76, 87, 46, 70),
    m('Hwang Hee-chan', 78, 'ST', ['LW'], 'Wolves', 'Premier League', 'South Korea', 86, 76, 70, 80, 42, 76),
    m('Weston McKennie', 79, 'CM', ['RB', 'CDM'], 'Juventus', 'Serie A', 'USA', 76, 72, 76, 76, 76, 84),
    m('Yunus Musah', 77, 'CM', ['CDM', 'RM'], 'AC Milan', 'Serie A', 'USA', 84, 64, 74, 80, 72, 78),
    m('Brennan Johnson', 80, 'RW', ['ST'], 'Tottenham', 'Premier League', 'Wales', 90, 76, 72, 82, 42, 70),
    m('Mohammed Kudus', 83, 'RW', ['CAM', 'ST'], 'Tottenham', 'Premier League', 'Ghana', 86, 78, 78, 88, 50, 78),
    m('Ademola Lookman', 84, 'LW', ['ST', 'RW'], 'Atalanta', 'Serie A', 'Nigeria', 88, 80, 78, 86, 44, 70),
    m('Charles De Ketelaere', 81, 'CAM', ['ST'], 'Atalanta', 'Serie A', 'Belgium', 80, 78, 80, 83, 52, 80),
    m('Ferran Torres', 81, 'LW', ['ST'], 'Barcelona', 'La Liga', 'Spain', 84, 78, 76, 82, 44, 70),
    m('Andrés García', 76, 'RB', ['RWB'], 'Aston Villa', 'Premier League', 'Spain', 84, 55, 70, 76, 74, 72),
    m('Estêvão', 81, 'RW', ['CAM'], 'Chelsea', 'Premier League', 'Brazil', 88, 76, 76, 87, 38, 60),
    m('Endrick', 78, 'ST', [], 'Real Madrid', 'La Liga', 'Brazil', 86, 78, 66, 80, 36, 72),
    m('Franco Mastantuono', 78, 'CAM', ['RW'], 'Real Madrid', 'La Liga', 'Argentina', 80, 74, 78, 84, 48, 64),
    m('Warren Zaïre-Emery', 82, 'CM', ['CDM'], 'Paris SG', 'Ligue 1', 'France', 80, 72, 82, 82, 78, 76),
    m('Lucas Chevalier', 82, 'GK', [], 'Paris SG', 'Ligue 1', 'France', 50, 80, 76, 83, 82, 80),
    m('Illia Zabarnyi', 81, 'CB', [], 'Paris SG', 'Ligue 1', 'Ukraine', 80, 38, 68, 72, 82, 82),
    m('Senne Lammens', 76, 'GK', [], 'Manchester United', 'Premier League', 'Belgium', 46, 74, 68, 76, 76, 78),
    m('Patrick Dorgu', 76, 'LB', ['LWB', 'LM'], 'Manchester United', 'Premier League', 'Denmark', 90, 58, 70, 78, 72, 72),

    /* depth — silvers */
    m('James Trafford', 74, 'GK', [], 'Manchester City', 'Premier League', 'England', 44, 72, 68, 74, 72, 76),
    m('Tyler Dibling', 73, 'RW', ['CAM'], 'Everton', 'Premier League', 'England', 86, 68, 70, 80, 40, 60),
    m('Archie Gray', 74, 'CM', ['RB', 'CDM'], 'Tottenham', 'Premier League', 'England', 80, 62, 74, 76, 74, 72),
    m('Kobbie Mainoo', 80, 'CM', ['CDM'], 'Manchester United', 'Premier League', 'England', 76, 70, 80, 84, 74, 76),
    m('Lewis Miley', 72, 'CM', ['CDM'], 'Newcastle', 'Premier League', 'England', 70, 64, 74, 74, 70, 76),
    m('Mathys Tel', 76, 'ST', ['LW'], 'Tottenham', 'Premier League', 'France', 88, 74, 68, 80, 38, 72),
    m('Rasmus Højlund', 80, 'ST', [], 'Napoli', 'Serie A', 'Denmark', 86, 78, 66, 78, 40, 82),
    m('Joshua Zirkzee', 78, 'ST', ['CF'], 'Manchester United', 'Premier League', 'Netherlands', 76, 76, 74, 82, 42, 80),
    m('Antonee Robinson', 80, 'LB', ['LWB'], 'Fulham', 'Premier League', 'USA', 92, 56, 74, 78, 80, 80),
    m('Yves Bissouma', 79, 'CDM', ['CM'], 'Tottenham', 'Premier League', 'Mali', 80, 68, 76, 80, 80, 82),

    /* bronzes / lower for pack & SBC variety */
    m('Diego López', 70, 'LW', ['ST'], 'Valencia', 'La Liga', 'Spain', 84, 66, 68, 78, 42, 66),
    m('Tommy Doyle', 68, 'CM', ['CDM'], 'Wolves', 'Premier League', 'England', 70, 62, 72, 72, 68, 72),
    m('Jacob Ramsey', 75, 'CM', ['CAM'], 'Newcastle', 'Premier League', 'England', 80, 70, 74, 78, 64, 72),
    m('Caoimhín Kelleher', 78, 'GK', [], 'Brentford', 'Premier League', 'Republic of Ireland', 46, 76, 74, 78, 78, 78),
    m('Evann Guessand', 76, 'ST', ['LW'], 'Aston Villa', 'Premier League', 'Ivory Coast', 84, 74, 68, 78, 42, 80),
    m('Sékou Koné', 64, 'CDM', ['CM'], 'Manchester United', 'Premier League', 'Mali', 70, 56, 66, 68, 70, 74),
    m('Chido Obi', 63, 'ST', [], 'Manchester United', 'Premier League', 'Denmark', 82, 64, 50, 68, 36, 74),
    m('Mikey Moore', 67, 'LW', ['RW'], 'Tottenham', 'Premier League', 'England', 84, 60, 64, 76, 40, 56),
    m('Ayden Heaven', 64, 'CB', [], 'Manchester United', 'Premier League', 'England', 74, 36, 58, 64, 66, 72),
    m('Rico Lewis', 78, 'RB', ['CM', 'CDM'], 'Manchester City', 'Premier League', 'England', 80, 62, 78, 80, 74, 70),
    m('Nico O\'Reilly', 74, 'LB', ['CM'], 'Manchester City', 'Premier League', 'England', 80, 62, 74, 78, 72, 74),
    m('Maghnes Akliouche', 80, 'CAM', ['RW'], 'Monaco', 'Ligue 1', 'France', 84, 72, 80, 86, 44, 62),
    m('Lee Kang-in', 81, 'CAM', ['RW'], 'Paris SG', 'Ligue 1', 'South Korea', 80, 76, 82, 86, 50, 62),
    m('Eliesse Ben Seghir', 78, 'CAM', ['LW'], 'Bayer Leverkusen', 'Bundesliga', 'Morocco', 84, 74, 76, 84, 46, 64),
    m('Assane Diao', 74, 'LW', ['ST'], 'Como', 'Serie A', 'Senegal', 90, 68, 66, 80, 38, 60),
    m('Kenan Kömür', 62, 'CM', [], 'Galatasaray', 'Süper Lig', 'Turkey', 68, 58, 64, 66, 62, 68),
  ];

  RFC.PLAYERS = P;

  // Quick id lookup
  const byId = {};
  P.forEach((p) => (byId[p.id] = p));
  RFC.playerById = (id) => byId[id];

  // distinct lists used by filters
  RFC.LEAGUES = Array.from(new Set(P.map((p) => p.league))).sort();
  RFC.NATIONS = Array.from(new Set(P.map((p) => p.nation))).sort();
  RFC.CLUBS = Array.from(new Set(P.map((p) => p.club))).sort();
})(window.RFC);
