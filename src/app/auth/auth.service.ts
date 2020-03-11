import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { Store } from '@ngrx/store';

import { AuthData } from './auth-data.model';
import { TrainingService } from '../training/training.service';
import { MatSnackBar } from '@angular/material';
import { UIService } from '../shared/ui.service';
import * as fromRoot from '../app.reducer';
import * as UI from '../shared/ui.actions';

@Injectable()
export class AuthService {
    authChange = new Subject<boolean>();
    private isAuthenticated: boolean = false;

    constructor(
        private router: Router, 
        private fireAuth: AngularFireAuth, 
        private trainingService: TrainingService,
        private snackbar: MatSnackBar,
        private uiService: UIService,
        private store: Store<fromRoot.State>
    )
    {}

    registerUser(authData: AuthData) {
        //this.uiService.loadingStateChanged.next(true);
        this.store.dispatch(new UI.StartLoading());
        this.fireAuth.createUserWithEmailAndPassword(authData.email, authData.password)
        .then(result => {
            // this.uiService.loadingStateChanged.next(false);
            this.store.dispatch(new UI.StopLoading());
            this.authSuccessfully();
        })
        .catch(error => {
            // this.uiService.loadingStateChanged.next(false);
            this.store.dispatch(new UI.StopLoading());
            this.snackbar.open(error.message, null, {
                duration: 3000
            })
        });
    }

    login(authData: AuthData) {
        //this.uiService.loadingStateChanged.next(true);
        this.store.dispatch(new UI.StartLoading());
        this.fireAuth.signInWithEmailAndPassword(authData.email, authData.password)
        .then(result => {
            // this.uiService.loadingStateChanged.next(false);
            this.store.dispatch(new UI.StopLoading());
            this.authSuccessfully();
        })
        .catch(error => {
            //this.uiService.loadingStateChanged.next(false);
            this.store.dispatch(new UI.StopLoading());
            this.snackbar.open(error.message, null, {
                duration: 3000
            })
        })
    }

    logout() {
        this.trainingService.cancelSubscription();
        this.fireAuth.signOut();
        this.authChange.next(false);
        this.router.navigate(['/login']);
        this.isAuthenticated = false;
    }

    isAuth() {
        return this.isAuthenticated;
    }

    private authSuccessfully() {
        this.isAuthenticated = true;
        this.authChange.next(true);
        this.router.navigate(['/training']);
    }
}