import { Injectable } from "@angular/core";
import {HttpClient} from '@angular/common/http';
import {AuthData} from './auth-data.model';
import {Subject} from 'rxjs';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private token: string | null | undefined;
  private tokenTimer: any;
  private user: any;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) {
  }

  public getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUser() {
    return this.user;
  }

  public getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  public createUser(email: string, password: string) {
    const authData: AuthData = {
      email,
      password
    };
    this.http.post('http://localhost:3000/api/user/signup', authData)
      .subscribe(() => {
        this.router.navigate(['/']);
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  public login(email: string, password: string) {
    const authData: AuthData = {
      email,
      password
    };
    this.http.post<{token: string, expiresIn: number, email: string, userId: string}>(
      'http://localhost:3000/api/user/login', authData)
      .subscribe(response => {
        // console.log(response);
        const token = response.token;
        this.token = token;
        if (token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.user = {
            email: response.email,
            id: response.userId
          };
          this.authStatusListener.next(true);
          const expirationDate = new Date(new Date().getTime() + expiresInDuration * 1000);
          console.warn('TOKEN EXPIRES AT: ', expirationDate);
          this.saveAuthData(token, expirationDate, this.user);
          this.router.navigate(['/'])
        }
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  public autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.user = authInformation.user;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }


  public logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.user = null;
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  public setAuthTimer(duration: number) {
    console.log('Setting timer: ' + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000)
  }

  private saveAuthData(token: string, expirationDate: Date, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('user', user);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('user');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const user = localStorage.getItem('user');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      user
    }
  }
}
