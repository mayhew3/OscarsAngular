import { InMemoryDbService } from 'angular-in-memory-web-api';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class InMemoryDataService implements InMemoryDbService {
  dataStr = '[{"nominees":[{"category_id":1,"subtitle":"Call Me By Your Name","odds":null,"name":"TimothÃ©e Chalamet","id":2280},{"category_id":1,"subtitle":"Phantom Thread","odds":null,"name":"Daniel Day-Lewis","id":2281},{"category_id":1,"subtitle":"Get Out","odds":null,"name":"Daniel Kaluuya","id":2282},{"category_id":1,"subtitle":"Darkest Hour","odds":null,"name":"Gary Oldman","id":2283},{"category_id":1,"subtitle":"Roman J. Israel, Esquire","odds":null,"name":"Denzel Washington","id":2284}],"name":"Actor","id":1,"points":4},{"nominees":[{"category_id":2,"subtitle":"The Shape of Water","odds":null,"name":"Sally Hawkins","id":2285},{"category_id":2,"subtitle":"Three Billboards Outside Ebbing, Missouri","odds":null,"name":"Frances McDormand","id":2286},{"category_id":2,"subtitle":"I, Tonya","odds":null,"name":"Margot Robbie","id":2287},{"category_id":2,"subtitle":"Lady Bird","odds":null,"name":"Saorise Ronan","id":2288},{"category_id":2,"subtitle":"The Post","odds":null,"name":"Meryl Streep","id":2289}],"name":"Actress","id":2,"points":4},{"nominees":[{"category_id":3,"subtitle":"","odds":null,"name":"The Boss Baby","id":2300},{"category_id":3,"subtitle":"","odds":null,"name":"The Breadwinner","id":2301},{"category_id":3,"subtitle":"","odds":null,"name":"Coco","id":2302},{"category_id":3,"subtitle":"","odds":null,"name":"Ferdinand","id":2303},{"category_id":3,"subtitle":"","odds":null,"name":"Loving Vincent","id":2304}],"name":"Animated Feature","id":3,"points":3},{"nominees":[{"category_id":4,"subtitle":"","odds":null,"name":"Beauty and the Beast","id":2353},{"category_id":4,"subtitle":"","odds":null,"name":"Blade Runner 2049","id":2354},{"category_id":4,"subtitle":"","odds":null,"name":"Darkest Hour","id":2355},{"category_id":4,"subtitle":"","odds":null,"name":"Dunkirk","id":2356},{"category_id":4,"subtitle":"","odds":null,"name":"The Shape of Water","id":2357}],"name":"Art Direction","id":4,"points":2},{"nominees":[{"category_id":5,"subtitle":"","odds":null,"name":"Call Me By Your Name","id":2271},{"category_id":5,"subtitle":"","odds":null,"name":"Darkest Hour","id":2272},{"category_id":5,"subtitle":"","odds":null,"name":"Dunkirk","id":2273},{"category_id":5,"subtitle":"","odds":null,"name":"Get Out","id":2274},{"category_id":5,"subtitle":"","odds":null,"name":"Lady Bird","id":2275},{"category_id":5,"subtitle":"","odds":null,"name":"Phantom Thread","id":2276},{"category_id":5,"subtitle":"","odds":null,"name":"The Post","id":2277},{"category_id":5,"subtitle":"","odds":null,"name":"The Shape of Water","id":2278},{"category_id":5,"subtitle":"","odds":null,"name":"Three Billboards Outside Ebbing, Missouri","id":2279}],"name":"Best Picture","id":5,"points":5},{"nominees":[{"category_id":6,"subtitle":"","odds":null,"name":"Blade Runner 2049","id":2305},{"category_id":6,"subtitle":"","odds":null,"name":"Darkest Hour","id":2306},{"category_id":6,"subtitle":"","odds":null,"name":"Dunkirk","id":2307},{"category_id":6,"subtitle":"","odds":null,"name":"Mudbound","id":2308},{"category_id":6,"subtitle":"","odds":null,"name":"The Shape of Water","id":2309}],"name":"Cinematography","id":6,"points":2},{"nominees":[{"category_id":7,"subtitle":"","odds":null,"name":"Beauty and the Beast","id":2310},{"category_id":7,"subtitle":"","odds":null,"name":"Darkest Hour","id":2311},{"category_id":7,"subtitle":"","odds":null,"name":"The Phantom Thread","id":2312},{"category_id":7,"subtitle":"","odds":null,"name":"The Shape of Water","id":2313},{"category_id":7,"subtitle":"","odds":null,"name":"Victoria & Abdul","id":2314}],"name":"Costume Design","id":7,"points":2},{"nominees":[{"category_id":8,"subtitle":"Dunkirk","odds":null,"name":"Christopher Nolan","id":2315},{"category_id":8,"subtitle":"Get Out","odds":null,"name":"Jordan Peele","id":2316},{"category_id":8,"subtitle":"Lady Bird","odds":null,"name":"Greta Gerwig","id":2317},{"category_id":8,"subtitle":"Phantom Thread","odds":null,"name":"Paul Thomas Anderson","id":2318},{"category_id":8,"subtitle":"The Shape of Water","odds":null,"name":"Guillermo del Toro","id":2319}],"name":"Directing","id":8,"points":4},{"nominees":[{"category_id":9,"subtitle":"","odds":null,"name":"Abacus: Small Enough to Jail","id":2320},{"category_id":9,"subtitle":"","odds":null,"name":"Faces Places","id":2321},{"category_id":9,"subtitle":"","odds":null,"name":"Icarus","id":2322},{"category_id":9,"subtitle":"","odds":null,"name":"Last Men in Aleppo","id":2323},{"category_id":9,"subtitle":"","odds":null,"name":"Strong Island","id":2324}],"name":"Documentary Feature","id":9,"points":1},{"nominees":[{"category_id":10,"subtitle":"","odds":null,"name":"Edith + Eddie","id":2325},{"category_id":10,"subtitle":"","odds":null,"name":"Heaven is a Traffic Jam on the 405","id":2326},{"category_id":10,"subtitle":"","odds":null,"name":"Heroin(e)","id":2327},{"category_id":10,"subtitle":"","odds":null,"name":"Knife Skills","id":2328},{"category_id":10,"subtitle":"","odds":null,"name":"Traffic Stop","id":2329}],"name":"Documentary Short","id":10,"points":1},{"nominees":[{"category_id":11,"subtitle":"","odds":null,"name":"Baby Driver","id":2330},{"category_id":11,"subtitle":"","odds":null,"name":"Dunkirk","id":2331},{"category_id":11,"subtitle":"","odds":null,"name":"I, Tonya","id":2332},{"category_id":11,"subtitle":"","odds":null,"name":"The Shape of Water","id":2333},{"category_id":11,"subtitle":"","odds":null,"name":"Three Billboards Outside Ebbing, Missouri","id":2334}],"name":"Film Editing","id":11,"points":2},{"nominees":[{"category_id":12,"subtitle":"Chile","odds":null,"name":"A Fantastic Woman","id":2335},{"category_id":12,"subtitle":"Lebanon","odds":null,"name":"The Insult","id":2336},{"category_id":12,"subtitle":"Russia","odds":null,"name":"Loveless","id":2337},{"category_id":12,"subtitle":"Hungary","odds":null,"name":"On Body and Soul","id":2338},{"category_id":12,"subtitle":"Sweden","odds":null,"name":"The Square","id":2339}],"name":"Foreign Language Film","id":12,"points":1},{"nominees":[{"category_id":13,"subtitle":"","odds":null,"name":"Darkest Hour","id":2340},{"category_id":13,"subtitle":"","odds":null,"name":"Victoria & Abdul","id":2341},{"category_id":13,"subtitle":"","odds":null,"name":"Wonder","id":2342}],"name":"Makeup","id":13,"points":2},{"nominees":[{"category_id":14,"subtitle":"","odds":null,"name":"Dunkirk","id":2343},{"category_id":14,"subtitle":"","odds":null,"name":"Phantom Thread","id":2344},{"category_id":14,"subtitle":"","odds":null,"name":"The Shape of Water","id":2345},{"category_id":14,"subtitle":"","odds":null,"name":"Star Wars: The Last Jedi","id":2346},{"category_id":14,"subtitle":"","odds":null,"name":"Three Bilboards Outside Ebbing, Missouri","id":2347}],"name":"Music (Score)","id":14,"points":2},{"nominees":[{"category_id":15,"subtitle":"Mudbound","odds":null,"name":"Mighty River (Music and lyric by Mary J. Blige, Raphael Saadiq and Taura Stinson)","id":2348},{"category_id":15,"subtitle":"Call Me by Your Name","odds":null,"name":"Mystery of Love (Music and lyric by Sufjan Stevens)","id":2349},{"category_id":15,"subtitle":"Coco","odds":null,"name":"Remember Me (Music and lyric by Kristen Anderson-Lopez and Robert Lopez)","id":2350},{"category_id":15,"subtitle":"Marshall","odds":null,"name":"Stand Up For Something (Music by Diane Warren; Lyric by Lonnie R. Lynn and Diane Warren)","id":2351},{"category_id":15,"subtitle":"The Greatest Showman","odds":null,"name":"This Is Me (Music and Lyric by Benj Pasek and Justin Paul)","id":2352}],"name":"Music (Song)","id":15,"points":2},{"nominees":[{"category_id":16,"subtitle":"","odds":null,"name":"Dear Basketball","id":2358},{"category_id":16,"subtitle":"","odds":null,"name":"Garden Party","id":2359},{"category_id":16,"subtitle":"","odds":null,"name":"Lou","id":2360},{"category_id":16,"subtitle":"","odds":null,"name":"Negative Space","id":2361},{"category_id":16,"subtitle":"","odds":null,"name":"Revolting Rhymes","id":2362}],"name":"Short Film (Animated)","id":16,"points":1},{"nominees":[{"category_id":17,"subtitle":"","odds":null,"name":"Dekalb Elementary","id":2363},{"category_id":17,"subtitle":"","odds":null,"name":"The Eleven O\'Clock","id":2364},{"category_id":17,"subtitle":"","odds":null,"name":"My Nephew Emmett","id":2365},{"category_id":17,"subtitle":"","odds":null,"name":"The Silent Child","id":2366},{"category_id":17,"subtitle":"","odds":null,"name":"Watu Wote: All of Us","id":2367}],"name":"Short Film (Live Action)","id":17,"points":1},{"nominees":[{"category_id":18,"subtitle":"","odds":null,"name":"Baby Driver","id":2368},{"category_id":18,"subtitle":"","odds":null,"name":"Blade Runner 2049","id":2369},{"category_id":18,"subtitle":"","odds":null,"name":"Dunkirk","id":2370},{"category_id":18,"subtitle":"","odds":null,"name":"The Shape of Water","id":2371},{"category_id":18,"subtitle":"","odds":null,"name":"Star Wars: The Last Jedi","id":2372}],"name":"Sound Editing","id":18,"points":2},{"nominees":[{"category_id":19,"subtitle":"","odds":null,"name":"Baby Driver","id":2373},{"category_id":19,"subtitle":"","odds":null,"name":"Blade Runner 2049","id":2374},{"category_id":19,"subtitle":"","odds":null,"name":"Dunkirk","id":2375},{"category_id":19,"subtitle":"","odds":null,"name":"The Shape of Water","id":2376},{"category_id":19,"subtitle":"","odds":null,"name":"Star Wars: The Last Jedi","id":2377}],"name":"Sound Mixing","id":19,"points":2},{"nominees":[{"category_id":20,"subtitle":"The Florida Project","odds":null,"name":"Willem Dafoe","id":2290},{"category_id":20,"subtitle":"Three Billboards Outside Ebbing, Missouri","odds":null,"name":"Woody Harrelson","id":2291},{"category_id":20,"subtitle":"The Shape of Water","odds":null,"name":"Richard Jenkins","id":2292},{"category_id":20,"subtitle":"All the Money in the World","odds":null,"name":"Christopher Plummer","id":2293},{"category_id":20,"subtitle":"Three Billboards Outside Ebbing, Missouri","odds":null,"name":"Sam Rockwell","id":2294}],"name":"Supporting Actor","id":20,"points":3},{"nominees":[{"category_id":21,"subtitle":"Mudbound","odds":null,"name":"Mary J. Blige","id":2295},{"category_id":21,"subtitle":"I, Tonya","odds":null,"name":"Allison Janney","id":2296},{"category_id":21,"subtitle":"Phantom Thread","odds":null,"name":"Lesley Manville","id":2297},{"category_id":21,"subtitle":"Lady Bird","odds":null,"name":"Laurie Metcalf","id":2298},{"category_id":21,"subtitle":"The Shape of Water","odds":null,"name":"Octavia Spencer","id":2299}],"name":"Supporting Actress","id":21,"points":3},{"nominees":[{"category_id":22,"subtitle":"","odds":null,"name":"Blade Runner 2049","id":2378},{"category_id":22,"subtitle":"","odds":null,"name":"Guardians of the Galaxy Vol. 2","id":2379},{"category_id":22,"subtitle":"","odds":null,"name":"Kong: Skull Island","id":2380},{"category_id":22,"subtitle":"","odds":null,"name":"Star Wars: The Last Jedi","id":2381},{"category_id":22,"subtitle":"","odds":null,"name":"War for the Planet of the Apes","id":2382}],"name":"Visual Effects","id":22,"points":2},{"nominees":[{"category_id":23,"subtitle":"Call Me By Your Name","odds":null,"name":"James Ivory","id":2383},{"category_id":23,"subtitle":"The Disaster Artist","odds":null,"name":"Scott Neustadter & Michael H. Weber","id":2384},{"category_id":23,"subtitle":"Logan","odds":null,"name":"Scott Frank & James Mangold (screenplay) and Michael Green; James Mangold (story)","id":2385},{"category_id":23,"subtitle":"Molly\'s Game","odds":null,"name":"Aaron Sorkin","id":2386},{"category_id":23,"subtitle":"Mudbound","odds":null,"name":"Virgil Williams and Dee Rees","id":2387}],"name":"Writing (Adapted Screenplay)","id":23,"points":3},{"nominees":[{"category_id":24,"subtitle":"The Big Sick","odds":null,"name":"Emily V. Gordon & Kumail Nanjiani","id":2388},{"category_id":24,"subtitle":"Get Out","odds":null,"name":"Jordan Peele","id":2389},{"category_id":24,"subtitle":"Lady Bird","odds":null,"name":"Greta Gerwig","id":2390},{"category_id":24,"subtitle":"The Shape of Water","odds":null,"name":"Guillermo del Toro & Vanessa Taylor (screenplay); Guillermo del Toro (story)","id":2391},{"category_id":24,"subtitle":"Three Billboards Outside Ebbing, Missouri","odds":null,"name":"Martin McDonagh","id":2392}],"name":"Writing (Original Screenplay)","id":24,"points":3}]';

  createDb(): {} {
    const nominees = [
      {
        id: 1,
        name: 'The Post',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 2,
        name: 'Darkest Hour',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 3,
        name: 'Dunkirk',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 4,
        name: 'Get Out',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 5,
        name: 'Lady Bird',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 6,
        name: 'Phantom Thread',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 7,
        name: 'The Shape of Water',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 8,
        name: 'Three Billboards Outside Ebbing, Missouri',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 9,
        name: 'Call Me By Your Name',
        subtitle: null,
        odds: null,
        category_id: 1
      },
      {
        id: 10,
        name: 'Gary Oldman',
        subtitle: 'Darkest Hour',
        odds: null,
        category_id: 2
      },
      {
        id: 11,
        name: 'Daniel Kaluuya',
        subtitle: 'Get Out',
        odds: null,
        category_id: 2
      },
      {
        id: 12,
        name: 'Daniel Day-Lewis',
        subtitle: 'Phantom Thread',
        odds: null,
        category_id: 2
      },
      {
        id: 13,
        name: 'Timothee Chalamet',
        subtitle: 'Call Me By Your Name',
        odds: null,
        category_id: 2
      },
      {
        id: 14,
        name: 'Denzel Washington',
        subtitle: 'Roman J. Isreal, Esquire',
        odds: null,
        category_id: 2
      }
    ];
    const categories = JSON.parse(this.dataStr);
    return {categories, nominees};
  }


}
