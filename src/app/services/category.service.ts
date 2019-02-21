import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Category} from '../interfaces/Category';
import {catchError, tap} from 'rxjs/operators';
import {_} from 'underscore';
import {Nominee} from '../interfaces/Nominee';
import {AuthService} from './auth/auth.service';
import {SystemVarsService} from './system.vars.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  nomineesUrl = 'api/nominees';
  categoriesUrl = 'api/categories';
  cache: Category[];

  constructor(private http: HttpClient,
              private auth: AuthService,
              private systemVarsService: SystemVarsService) {
    this.cache = [];
  }

  // HELPERS

  private static addToArray<T>(existingArray: T[], newArray: T[]) {
    existingArray.push.apply(existingArray, newArray);
  }

  // REAL METHODS

  getCategories(): Observable<Category[]> {
    return this.maybeUpdateCache();
  }

  getCategory(id: number): Observable<Category> {
    return this.getDataWithCacheUpdate<Category>(() => {
      return this.getCategoryFromCache(id);
    });
  }

  private getCategoryFromCache(id: number): Category {
    return _.findWhere(this.cache, {id: id});
  }

  getNextCategory(id: number): Observable<Category> {
    return this.getDataWithCacheUpdate<Category>(() => {
      const foundIndex = _.findIndex(this.cache, {id: id});
      if (foundIndex === -1 || this.cache.length < (foundIndex + 1)) {
        return null;
      }
      return this.cache[foundIndex + 1];
    });
  }

  getPreviousCategory(id: number): Observable<Category> {
    return this.getDataWithCacheUpdate<Category>(() => {
      const foundIndex = _.findIndex(this.cache, {id: id});
      if (0 > (foundIndex - 1)) {
        return null;
      }
      return this.cache[foundIndex - 1];
    });
  }

  getNominees(category_id: number): Observable<Nominee[]> {
    return this.getDataWithCacheUpdate<Nominee[]>(() => {
      const category = this.getCategoryFromCache(category_id);
      return category ? category.nominees : [];
    });
  }

  updateNominee(nominee: Nominee): Observable<any> {
    return this.http.put(this.nomineesUrl, nominee, httpOptions)
      .pipe(
        tap(() => console.log('did some tapping')),
        catchError(this.handleError<any>('updateCategories', nominee))
      );
  }

  stillLoading(): boolean {
    return this.cache.length === 0;
  }

  // DATA HELPERS

  private getDataWithCacheUpdate<T>(getCallback): Observable<T> {
    return new Observable(observer => {
      this.maybeUpdateCache().subscribe(
        () => observer.next(getCallback()),
        (err: Error) => observer.error(err)
      );
    });
  }

  private maybeUpdateCache(): Observable<Category[]> {
    if (this.cache.length === 0) {
      return new Observable<Category[]>((observer) => {
        this.auth.getPerson().subscribe(person => {
          if (!person) {
            this.auth.logout();
          }
          this.systemVarsService.getSystemVars().subscribe(systemVars => {
            const options = {
              params: {
                person_id: person.id.toString(),
                year: systemVars.curr_year.toString()
              }};
            this.http.get<Category[]>(this.categoriesUrl, options)
              .pipe(
                catchError(this.handleError<Category[]>('getCategories', []))
              )
              .subscribe(
                (categories: Category[]) => {
                  CategoryService.addToArray(this.cache, categories);
                  observer.next(categories);
                },
                (err: Error) => observer.error(err)
              );
          });
        });
      });
    } else {
      return of(this.cache);
    }
  }



  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
