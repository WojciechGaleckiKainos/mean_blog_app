import {Injectable} from '@angular/core';
import {AuthData} from './auth-data.model';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private url = 'http://localhost:3000/api/user';
  private token: string;
  private authStatusListener = new Subject<boolean>();
  private tokenTimer: any;
  private TOKEN_KEY = 'token';
  private EXPIRATION_KEY = 'expiration';

  constructor(private http: HttpClient, private router: Router) {
  }

  registerUser(authData: AuthData) {
    this.http.post(this.url + '/signup', authData)
      .subscribe(response => {
        console.log('Successfully registered a new user');
      });
  }

  loginUser(authData: AuthData) {
    this.http.post<{ token: string, expiresIn: number }>(this.url + '/login', authData)
      .subscribe(response => {
        this.token = response.token;
        if (this.token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          this.saveAuthDataToLocalStorage(this.token, expiresInDuration);
          this.redirectToTheHomePage();
          console.log('Successfully login a user');
        }
      });
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthDataFromLocalStorage();
    this.redirectToTheHomePage();
    console.log('Successfully logout a user');
  }

  autoAuthUser() {
    console.log('Checking user token expiration status...');
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      console.log('Authentication token is still valid');
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    } else {
      console.log('Authentication token has expired');
    }
  }

  redirectToTheHomePage() {
    this.router.navigate(['/']);
  }

  private setAuthTimer(expiresInDuration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, expiresInDuration * 1000);
  }

  private saveAuthDataToLocalStorage(token: string, expiresInDuration: number) {
    const expirationDate = new Date(new Date().getTime() + expiresInDuration * 1000);
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.EXPIRATION_KEY, expirationDate.toISOString());
  }

  private clearAuthDataFromLocalStorage() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EXPIRATION_KEY);
  }

  private getAuthData() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const expirationDate = localStorage.getItem(this.EXPIRATION_KEY);
    if (!token || !expirationDate) {
      return;
    }
    console.log('Authentication token is present on the user local storage');
    return {
      token,
      expirationDate: new Date(expirationDate)
    };
  }
}
