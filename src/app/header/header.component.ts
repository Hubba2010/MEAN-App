import {
  Component,
  OnDestroy,
  OnInit
} from "@angular/core";
import {AuthService} from '../auth/auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  public userIsAuthenticated = false;
  private authListenerSubs!: Subscription;

  constructor(private authService: AuthService) {
  }

  public ngOnInit() {
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
    })
  }

  public onLogout() {
    this.authService.logout();
  }

  public ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }
}
