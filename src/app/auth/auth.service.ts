import {Injectable} from '@angular/core';
import {AuthData} from './auth-data.model';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = 'http://localhost:3000/api/user';

  constructor(private http: HttpClient) {
  }

  createUser(authData: AuthData) {
    this.http.post(this.url + '/signup', authData)
      .subscribe(response => {
        console.log('Successfully registered new user');
      });
  }
}
