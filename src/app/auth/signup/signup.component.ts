import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthService} from '../auth.service';
import {error} from 'util';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authStatusSub: Subscription;

  constructor(public authService: AuthService) {
  }

  ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthStatusListener()
      .subscribe(authStatus => {
          this.isLoading = false;
        }
      );
  }

  onSignUp(form: NgForm) {
    if (form.invalid) {
      return;
    }
    const authData = {
      email: form.value.email,
      password: form.value.password
    };
    this.isLoading = true;
    this.authService.registerUser(authData);
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }
}
