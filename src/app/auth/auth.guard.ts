import { 
  CanActivate, 
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanLoad,
  Route
} from '@angular/router';
import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { AuthService } from './auth.service';
import * as fromRoot from '../app.reducer';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {
  constructor(
    private authService: AuthService, 
    private router: Router,
    private store: Store<fromRoot.State>
  ) {

  }
    
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select(fromRoot.getIsAuthenticated).pipe(take(1));
  }

  canLoad(route: Route) {
    return this.store.select(fromRoot.getIsAuthenticated).pipe(take(1));
  }
}