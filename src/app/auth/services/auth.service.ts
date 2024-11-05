import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { sign } from 'crypto';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { AuthStatus, LoginResponse, User } from '../interfaces';
import { response } from 'express';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl: string = environment.baseUrl;
  private http = inject( HttpClient );

  private _currentUser = signal<User|null>(null);
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);

  //! Variables para el mundo exterior

  public currentUser  = computed(() => this._currentUser());
  public authStatus  = computed(() => this._authStatus());

  constructor() { }

  login( email: string, password: string): Observable<boolean>{

    const url = `${ this.baseUrl }/auth/login`;
    const body = {email, password};

    return this.http.post<LoginResponse>(url, body)
    .pipe(
      tap( ({user, token}) =>{
        this._currentUser.set(user);
        this._authStatus.set(AuthStatus.authenticated);
        localStorage.setItem('token', token);
      }),
      map(() => true),

      //Todo falta manejar errores
      catchError( err => throwError( ()=> err.error.message)
      )
    )
  }
}
