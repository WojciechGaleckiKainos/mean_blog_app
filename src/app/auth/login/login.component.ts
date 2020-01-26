import {Component} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoading = false;

  constructor(public authService: AuthService) {
  }

  onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }
    const authData = {
      email: form.value.email,
      password: form.value.password
    };
    this.isLoading = true;
    this.authService.loginUser(authData);
  }
}
