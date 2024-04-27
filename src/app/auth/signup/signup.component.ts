import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthService} from '../auth.service';
import {Subscription} from 'rxjs';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  public isLoading = false;
  private authStatusSub!: Subscription;

  constructor(private authService: AuthService) {
  }

  public ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    )
  }

  public onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true
    this.authService.createUser(form.value.email, form.value.password);
  }

  public ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
