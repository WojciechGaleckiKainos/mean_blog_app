import {Injectable} from '@angular/core';
import {AuthData} from './auth-data.model';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = 'http://localhost:3000/api/user';
  private token: string;

  constructor(private http: HttpClient) {
  }

  registerUser(authData: AuthData) {
    this.http.post(this.url + '/signup', authData)
      .subscribe(response => {
        console.log('Successfully registered a new user');
      });
  }

  loginUser(authData: AuthData) {
    this.http.post<{ token: string }>(this.url + '/login', authData)
      .subscribe(response => {
        this.token = response.token;
        console.log('Successfully login a user');
      });
  }

  getToken() {
    return this.token;
  }
}
