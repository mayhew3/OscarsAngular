import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {SystemVars} from '../interfaces/SystemVars';
import {catchError} from 'rxjs/operators';
import {SocketService} from './socket.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class SystemVarsService {
  systemVarsUrl = 'api/systemVars';
  private systemVars: SystemVars;

  constructor(private http: HttpClient,
              private socket: SocketService) {
    this.getSystemVars().subscribe(() => {
      this.socket.on('voting', msg => {
        if (!!msg.voting_open) {
          this.unlockVotingInternal();
        } else {
          this.lockVotingInternal();
        }
      });
    });
    this.getSystemVars().subscribe(() => {
      this.socket.on('its_over', msg => {
        if (!!msg.its_over) {
          this.makeItOverInternal();
        } else {
          this.makeItNotOverInternal();
        }
      });
    });
  }

  canVote(): boolean {
    return !!this.systemVars && !!this.systemVars.voting_open;
  }

  getCurrentYear(): number {
    return this.systemVars ? this.systemVars.curr_year : undefined;
  }

  lockVotingInternal(): void {
    this.getSystemVars().subscribe(() => {
      this.systemVars.voting_open = false;
    });
  }

  unlockVotingInternal(): void {
    this.getSystemVars().subscribe(() => {
      this.systemVars.voting_open = true;
    });
  }

  makeItOverInternal(): void {
    this.getSystemVars().subscribe(() => {
      this.systemVars.its_over = true;
    });
  }

  makeItNotOverInternal(): void {
    this.getSystemVars().subscribe(() => {
      this.systemVars.its_over = false;
    });
  }

  toggleVotingLock(): void {
    if (!this.systemVars) {
      throw new Error('No system vars found.');
    }
    const targetVars = {
      id: this.systemVars.id,
      voting_open: !this.systemVars.voting_open,
      curr_year: this.systemVars.curr_year,
      its_over: this.systemVars.its_over
    };

    this.http.put(this.systemVarsUrl, targetVars, httpOptions)
      .pipe(catchError(this.handleError<any>('toggleVotingLock')))
      .subscribe();
  }

  changeCurrentYear(year: number): Observable<any> {
    const outsideThis = this;
    return new Observable<any>(observer => {
      const targetVars = {
        id: this.systemVars.id,
        voting_open: this.systemVars.voting_open,
        curr_year: year,
        its_over: this.systemVars.its_over
      };

      this.http.put(this.systemVarsUrl, targetVars, httpOptions)
        .pipe(catchError(this.handleError<any>('changeCurrentYear')))
        .subscribe(() => {
          outsideThis.systemVars.curr_year = year;
          observer.next();
        });
    });
  }

  toggleItsOver(): void {
    if (!this.systemVars) {
      throw new Error('No system vars found.');
    }
    const targetVars = {
      id: this.systemVars.id,
      voting_open: this.systemVars.voting_open,
      curr_year: this.systemVars.curr_year,
      its_over: !this.systemVars.its_over
    };

    this.http.put(this.systemVarsUrl, targetVars, httpOptions)
      .pipe(catchError(this.handleError<any>('toggleItsOver')))
      .subscribe();
  }

  stillLoading(): boolean {
    return this.systemVars === undefined;
  }

  getSystemVars(): Observable<SystemVars> {
    if (this.systemVars) {
      return of(this.systemVars);
    } else {
      return new Observable<SystemVars>(observer => {
        this.http.get<SystemVars[]>(this.systemVarsUrl)
          .pipe(
            catchError(this.handleError<SystemVars[]>('getSystemVars', []))
          )
          .subscribe((systemVars: SystemVars[]) => {
              if (systemVars.length !== 1) {
                throw new Error('Should only have one row in system vars.');
              }
              this.systemVars = systemVars[0];
              observer.next(systemVars[0]);
            },
            (err: Error) => observer.error(err));
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

  itsOver(): boolean {
    return this.systemVars.its_over;
  }
}
