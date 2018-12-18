import {getStatusText, InMemoryDbService, RequestInfo, ResponseOptions, STATUS} from 'angular-in-memory-web-api';
import {Injectable} from '@angular/core';
import {_} from 'underscore';

@Injectable({
  providedIn: 'root',
})

export class InMemoryDataService implements InMemoryDbService {
  // tslint:disable-next-line
  dataStr = '[{"nominees":[{"category_id":1,"odds":null,"context":"Call Me By Your Name","nominee":"TimothÃ©e Chalamet","id":2280},{"category_id":1,"odds":null,"context":"Phantom Thread","nominee":"Daniel Day-Lewis","id":2281},{"category_id":1,"odds":null,"context":"Get Out","nominee":"Daniel Kaluuya","id":2282},{"category_id":1,"odds":null,"context":"Darkest Hour","nominee":"Gary Oldman","id":2283},{"category_id":1,"odds":null,"context":"Roman J. Israel, Esquire","nominee":"Denzel Washington","id":2284}],"name":"Actor","id":1,"points":4},{"nominees":[{"category_id":2,"odds":null,"context":"Three Billboards Outside Ebbing, Missouri","nominee":"Frances McDormand","id":2286},{"category_id":2,"odds":null,"context":"I, Tonya","nominee":"Margot Robbie","id":2287},{"category_id":2,"odds":null,"context":"Lady Bird","nominee":"Saorise Ronan","id":2288},{"category_id":2,"odds":null,"context":"The Post","nominee":"Meryl Streep","id":2289},{"category_id":2,"odds":null,"context":"The Shape of Water","nominee":"Sally Hawkins","id":2285}],"name":"Actress","id":2,"points":4},{"nominees":[{"category_id":3,"odds":null,"context":"","nominee":"The Boss Baby","id":2300},{"category_id":3,"odds":null,"context":"","nominee":"The Breadwinner","id":2301},{"category_id":3,"odds":null,"context":"","nominee":"Coco","id":2302},{"category_id":3,"odds":null,"context":"","nominee":"Ferdinand","id":2303},{"category_id":3,"odds":null,"context":"","nominee":"Loving Vincent","id":2304}],"name":"Animated Feature","id":3,"points":3},{"nominees":[{"category_id":4,"odds":null,"context":"","nominee":"Beauty and the Beast","id":2353},{"category_id":4,"odds":null,"context":"","nominee":"Blade Runner 2049","id":2354},{"category_id":4,"odds":null,"context":"","nominee":"Darkest Hour","id":2355},{"category_id":4,"odds":null,"context":"","nominee":"Dunkirk","id":2356},{"category_id":4,"odds":null,"context":"","nominee":"The Shape of Water","id":2357}],"name":"Art Direction","id":4,"points":2},{"nominees":[{"category_id":5,"odds":null,"context":"","nominee":"Call Me By Your Name","id":2271},{"category_id":5,"odds":null,"context":"","nominee":"Darkest Hour","id":2272},{"category_id":5,"odds":null,"context":"","nominee":"Dunkirk","id":2273},{"category_id":5,"odds":null,"context":"","nominee":"Get Out","id":2274},{"category_id":5,"odds":null,"context":"","nominee":"Lady Bird","id":2275},{"category_id":5,"odds":null,"context":"","nominee":"Phantom Thread","id":2276},{"category_id":5,"odds":null,"context":"","nominee":"The Post","id":2277},{"category_id":5,"odds":null,"context":"","nominee":"The Shape of Water","id":2278},{"category_id":5,"odds":null,"context":"","nominee":"Three Billboards Outside Ebbing, Missouri","id":2279}],"name":"Best Picture","id":5,"points":5},{"nominees":[{"category_id":6,"odds":null,"context":"","nominee":"Blade Runner 2049","id":2305},{"category_id":6,"odds":null,"context":"","nominee":"Darkest Hour","id":2306},{"category_id":6,"odds":null,"context":"","nominee":"Dunkirk","id":2307},{"category_id":6,"odds":null,"context":"","nominee":"Mudbound","id":2308},{"category_id":6,"odds":null,"context":"","nominee":"The Shape of Water","id":2309}],"name":"Cinematography","id":6,"points":2},{"nominees":[{"category_id":7,"odds":null,"context":"","nominee":"Beauty and the Beast","id":2310},{"category_id":7,"odds":null,"context":"","nominee":"Darkest Hour","id":2311},{"category_id":7,"odds":null,"context":"","nominee":"The Phantom Thread","id":2312},{"category_id":7,"odds":null,"context":"","nominee":"The Shape of Water","id":2313},{"category_id":7,"odds":null,"context":"","nominee":"Victoria & Abdul","id":2314}],"name":"Costume Design","id":7,"points":2},{"nominees":[{"category_id":8,"odds":null,"context":"Dunkirk","nominee":"Christopher Nolan","id":2315},{"category_id":8,"odds":null,"context":"Get Out","nominee":"Jordan Peele","id":2316},{"category_id":8,"odds":null,"context":"Lady Bird","nominee":"Greta Gerwig","id":2317},{"category_id":8,"odds":null,"context":"Phantom Thread","nominee":"Paul Thomas Anderson","id":2318},{"category_id":8,"odds":null,"context":"The Shape of Water","nominee":"Guillermo del Toro","id":2319}],"name":"Directing","id":8,"points":4},{"nominees":[{"category_id":9,"odds":null,"context":"","nominee":"Abacus: Small Enough to Jail","id":2320},{"category_id":9,"odds":null,"context":"","nominee":"Faces Places","id":2321},{"category_id":9,"odds":null,"context":"","nominee":"Icarus","id":2322},{"category_id":9,"odds":null,"context":"","nominee":"Last Men in Aleppo","id":2323},{"category_id":9,"odds":null,"context":"","nominee":"Strong Island","id":2324}],"name":"Documentary Feature","id":9,"points":1},{"nominees":[{"category_id":10,"odds":null,"context":"","nominee":"Edith + Eddie","id":2325},{"category_id":10,"odds":null,"context":"","nominee":"Heaven is a Traffic Jam on the 405","id":2326},{"category_id":10,"odds":null,"context":"","nominee":"Heroin(e)","id":2327},{"category_id":10,"odds":null,"context":"","nominee":"Knife Skills","id":2328},{"category_id":10,"odds":null,"context":"","nominee":"Traffic Stop","id":2329}],"name":"Documentary Short","id":10,"points":1},{"nominees":[{"category_id":11,"odds":null,"context":"","nominee":"Baby Driver","id":2330},{"category_id":11,"odds":null,"context":"","nominee":"Dunkirk","id":2331},{"category_id":11,"odds":null,"context":"","nominee":"I, Tonya","id":2332},{"category_id":11,"odds":null,"context":"","nominee":"The Shape of Water","id":2333},{"category_id":11,"odds":null,"context":"","nominee":"Three Billboards Outside Ebbing, Missouri","id":2334}],"name":"Film Editing","id":11,"points":2},{"nominees":[{"category_id":12,"odds":null,"context":"Chile","nominee":"A Fantastic Woman","id":2335},{"category_id":12,"odds":null,"context":"Lebanon","nominee":"The Insult","id":2336},{"category_id":12,"odds":null,"context":"Russia","nominee":"Loveless","id":2337},{"category_id":12,"odds":null,"context":"Hungary","nominee":"On Body and Soul","id":2338},{"category_id":12,"odds":null,"context":"Sweden","nominee":"The Square","id":2339}],"name":"Foreign Language Film","id":12,"points":1},{"nominees":[{"category_id":13,"odds":null,"context":"","nominee":"Darkest Hour","id":2340},{"category_id":13,"odds":null,"context":"","nominee":"Victoria & Abdul","id":2341},{"category_id":13,"odds":null,"context":"","nominee":"Wonder","id":2342}],"name":"Makeup","id":13,"points":2},{"nominees":[{"category_id":14,"odds":null,"context":"","nominee":"Dunkirk","id":2343},{"category_id":14,"odds":null,"context":"","nominee":"Phantom Thread","id":2344},{"category_id":14,"odds":null,"context":"","nominee":"The Shape of Water","id":2345},{"category_id":14,"odds":null,"context":"","nominee":"Star Wars: The Last Jedi","id":2346},{"category_id":14,"odds":null,"context":"","nominee":"Three Bilboards Outside Ebbing, Missouri","id":2347}],"name":"Music (Score)","id":14,"points":2},{"nominees":[{"category_id":15,"odds":null,"context":"Mudbound","nominee":"Mighty River (Music and lyric by Mary J. Blige, Raphael Saadiq and Taura Stinson)","id":2348},{"category_id":15,"odds":null,"context":"Call Me by Your Name","nominee":"Mystery of Love (Music and lyric by Sufjan Stevens)","id":2349},{"category_id":15,"odds":null,"context":"Coco","nominee":"Remember Me (Music and lyric by Kristen Anderson-Lopez and Robert Lopez)","id":2350},{"category_id":15,"odds":null,"context":"Marshall","nominee":"Stand Up For Something (Music by Diane Warren; Lyric by Lonnie R. Lynn and Diane Warren)","id":2351},{"category_id":15,"odds":null,"context":"The Greatest Showman","nominee":"This Is Me (Music and Lyric by Benj Pasek and Justin Paul)","id":2352}],"name":"Music (Song)","id":15,"points":2},{"nominees":[{"category_id":16,"odds":null,"context":"","nominee":"Dear Basketball","id":2358},{"category_id":16,"odds":null,"context":"","nominee":"Garden Party","id":2359},{"category_id":16,"odds":null,"context":"","nominee":"Lou","id":2360},{"category_id":16,"odds":null,"context":"","nominee":"Negative Space","id":2361},{"category_id":16,"odds":null,"context":"","nominee":"Revolting Rhymes","id":2362}],"name":"Short Film (Animated)","id":16,"points":1},{"nominees":[{"category_id":17,"odds":null,"context":"","nominee":"Dekalb Elementary","id":2363},{"category_id":17,"odds":null,"context":"","nominee":"The Eleven O\'Clock","id":2364},{"category_id":17,"odds":null,"context":"","nominee":"My Nephew Emmett","id":2365},{"category_id":17,"odds":null,"context":"","nominee":"The Silent Child","id":2366},{"category_id":17,"odds":null,"context":"","nominee":"Watu Wote: All of Us","id":2367}],"name":"Short Film (Live Action)","id":17,"points":1},{"nominees":[{"category_id":18,"odds":null,"context":"","nominee":"Baby Driver","id":2368},{"category_id":18,"odds":null,"context":"","nominee":"Blade Runner 2049","id":2369},{"category_id":18,"odds":null,"context":"","nominee":"Dunkirk","id":2370},{"category_id":18,"odds":null,"context":"","nominee":"The Shape of Water","id":2371},{"category_id":18,"odds":null,"context":"","nominee":"Star Wars: The Last Jedi","id":2372}],"name":"Sound Editing","id":18,"points":2},{"nominees":[{"category_id":19,"odds":null,"context":"","nominee":"Baby Driver","id":2373},{"category_id":19,"odds":null,"context":"","nominee":"Blade Runner 2049","id":2374},{"category_id":19,"odds":null,"context":"","nominee":"Dunkirk","id":2375},{"category_id":19,"odds":null,"context":"","nominee":"The Shape of Water","id":2376},{"category_id":19,"odds":null,"context":"","nominee":"Star Wars: The Last Jedi","id":2377}],"name":"Sound Mixing","id":19,"points":2},{"nominees":[{"category_id":20,"odds":null,"context":"The Florida Project","nominee":"Willem Dafoe","id":2290},{"category_id":20,"odds":null,"context":"Three Billboards Outside Ebbing, Missouri","nominee":"Woody Harrelson","id":2291},{"category_id":20,"odds":null,"context":"The Shape of Water","nominee":"Richard Jenkins","id":2292},{"category_id":20,"odds":null,"context":"All the Money in the World","nominee":"Christopher Plummer","id":2293},{"category_id":20,"odds":null,"context":"Three Billboards Outside Ebbing, Missouri","nominee":"Sam Rockwell","id":2294}],"name":"Supporting Actor","id":20,"points":3},{"nominees":[{"category_id":21,"odds":null,"context":"Mudbound","nominee":"Mary J. Blige","id":2295},{"category_id":21,"odds":null,"context":"I, Tonya","nominee":"Allison Janney","id":2296},{"category_id":21,"odds":null,"context":"Phantom Thread","nominee":"Lesley Manville","id":2297},{"category_id":21,"odds":null,"context":"Lady Bird","nominee":"Laurie Metcalf","id":2298},{"category_id":21,"odds":null,"context":"The Shape of Water","nominee":"Octavia Spencer","id":2299}],"name":"Supporting Actress","id":21,"points":3},{"nominees":[{"category_id":22,"odds":null,"context":"","nominee":"Blade Runner 2049","id":2378},{"category_id":22,"odds":null,"context":"","nominee":"Guardians of the Galaxy Vol. 2","id":2379},{"category_id":22,"odds":null,"context":"","nominee":"Kong: Skull Island","id":2380},{"category_id":22,"odds":null,"context":"","nominee":"Star Wars: The Last Jedi","id":2381},{"category_id":22,"odds":null,"context":"","nominee":"War for the Planet of the Apes","id":2382}],"name":"Visual Effects","id":22,"points":2},{"nominees":[{"category_id":23,"odds":null,"context":"Call Me By Your Name","nominee":"James Ivory","id":2383},{"category_id":23,"odds":null,"context":"The Disaster Artist","nominee":"Scott Neustadter & Michael H. Weber","id":2384},{"category_id":23,"odds":null,"context":"Logan","nominee":"Scott Frank & James Mangold (screenplay) and Michael Green; James Mangold (story)","id":2385},{"category_id":23,"odds":null,"context":"Molly\'s Game","nominee":"Aaron Sorkin","id":2386},{"category_id":23,"odds":null,"context":"Mudbound","nominee":"Virgil Williams and Dee Rees","id":2387}],"name":"Writing (Adapted Screenplay)","id":23,"points":3},{"nominees":[{"category_id":24,"odds":null,"context":"The Big Sick","nominee":"Emily V. Gordon & Kumail Nanjiani","id":2388},{"category_id":24,"odds":null,"context":"Get Out","nominee":"Jordan Peele","id":2389},{"category_id":24,"odds":null,"context":"Lady Bird","nominee":"Greta Gerwig","id":2390},{"category_id":24,"odds":null,"context":"The Shape of Water","nominee":"Guillermo del Toro & Vanessa Taylor (screenplay); Guillermo del Toro (story)","id":2391},{"category_id":24,"odds":null,"context":"Three Billboards Outside Ebbing, Missouri","nominee":"Martin McDonagh","id":2392}],"name":"Writing (Original Screenplay)","id":24,"points":3}]';
  categories = JSON.parse(this.dataStr);

  /////////// helpers ///////////////

  private static finishOptions(options: ResponseOptions, {headers, url}: RequestInfo) {
    options.statusText = getStatusText(options.status);
    options.headers = headers;
    options.url = url;
    return options;
  }

  createDb(): {} {
    // Need an empty nominees list so the service knows the collection exists.
    return {categories: this.categories, nominees: []};
  }

  // noinspection JSUnusedGlobalSymbols
  put(requestInfo: RequestInfo) {
    console.log('HTTP override: PUT');
    const collectionName = requestInfo.collectionName;
    if (collectionName === 'nominees') {
      this.updateNomination(requestInfo);
    }
    return undefined;
  }

  private updateNomination(requestInfo: RequestInfo) {
    const jsonBody = requestInfo.utils.getJsonBody(requestInfo.req);
    this.updateObject(jsonBody);

    const options: ResponseOptions = {
      body: {msg: 'Success!'},
      status: STATUS.OK
    };

    const finishedOptions = InMemoryDataService.finishOptions(options, requestInfo);

    return requestInfo.utils.createResponse$(() => finishedOptions);
  }

  private updateObject(jsonBody: any) {
    const id = jsonBody.id;
    const odds = jsonBody.odds;

    _.forEach(this.categories, function(category) {
      _.forEach(category.nominees, function(nominee) {
        if (nominee.id === id) {
          nominee.odds = odds;
        }
      });
    });
  }
}
