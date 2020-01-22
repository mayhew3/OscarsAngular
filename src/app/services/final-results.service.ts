import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FinalResult} from '../interfaces/FinalResult';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FinalResultsService {
  finalResultsUrl = 'api/finalResults';
  private finalResults: FinalResult[];

  constructor(private http: HttpClient) {
    this.getFinalResults().subscribe();
  }

  public getFinalResults(): Observable<FinalResult[]> {
    if (!!this.finalResults) {
      return of(this.finalResults);
    } else {
      return new Observable<FinalResult[]>(observer => {
        this.http.get<FinalResult[]>(this.finalResultsUrl)
          .pipe(
            catchError(this.handleError<FinalResult[]>('getFinalResults', []))
          )
          .subscribe((finalResults: FinalResult[]) => {
            this.finalResults = finalResults;
            observer.next(finalResults);
          });
      });
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
