import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AuthService } from 'src/app/auth/auth.service';
import * as fromRoot from '../../app.reducer';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() sidenavToggle = new EventEmitter<void>();
  isAuth$: Observable<boolean>;
  authSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private state: Store<fromRoot.State>  
  ) { }

  ngOnInit() {
    this.isAuth$ = this.state.select(fromRoot.getIsAuthenticated);
  }

  onToggleSidenav() {
    this.sidenavToggle.emit()
  }

  onLogout() {
    this.authService.logout();
  }
}
