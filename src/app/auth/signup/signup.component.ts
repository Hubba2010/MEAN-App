import {Component} from '@angular/core';
import {NgForm} from '@angular/forms';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  public isLoading = false;

  public onSignup(form: NgForm) {
    console.log(form.value)
  }
}
