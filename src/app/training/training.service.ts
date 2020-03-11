import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import 'firebase/firestore';
import { Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

import { Exercise } from './exercise.model';
import { UIService } from '../shared/ui.service';
import * as UI from '../shared/ui.actions';
import * as Training from './training.actions';
import * as fromTraining from './training.reducer';

@Injectable()
export class TrainingService {
    private exerciseCollection: AngularFirestoreCollection<Exercise>
    private fireSubscription: Subscription[] = []; 

    constructor(
        private db: AngularFirestore,
        private uiService: UIService,
        private store: Store<fromTraining.State>
        ) {}

    fetchAvailableExercises() {
        this.exerciseCollection = this.db.collection<Exercise>('availableExercises');

        this.store.dispatch(new UI.StartLoading());
        this.fireSubscription.push(this.exerciseCollection.snapshotChanges()
        .pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data() as Exercise;
                const id = a.payload.doc.id;
                return { id, ...data }
            }))
        )
        .subscribe((exercises: Exercise[]) => {
            this.store.dispatch(new UI.StopLoading());
            this.store.dispatch(new Training.SetAvailableTraining(exercises))
        }, error => {
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackBar('Fetching Exercises Failed', null, 3000);
        }));
    }

    startExercise(selectedId: string) {
        this.store.dispatch(new Training.StartTraining(selectedId));
    }

    completeExercise() {
        this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(ex => {
            this.addDataToDatabase({
                ...ex,
                date: new Date(),
                state: 'completed'
            });
            this.store.dispatch(new Training.StopTraining());
        });
    }

    cancelExercise(progress: number) {
        this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(ex => {
            this.addDataToDatabase({
                ...ex,
                duration: ex.duration * (progress / 100),
                calories: ex.calories * (progress / 100),
                date: new Date(),
                state: 'cancelled'
            });
            this.store.dispatch(new Training.StopTraining());
        })
    }

    fetchCompletedOrCancelledExercise() {
        this.fireSubscription.push(this.db.collection('finishedExercises').valueChanges().subscribe(
            (exercises: Exercise[]) => {
                this.store.dispatch(new Training.SetFinishedTraining(exercises));
            }
        ));
    }

    cancelSubscription() {
        this.fireSubscription.forEach(subs => subs.unsubscribe());
    }

    private addDataToDatabase(exercise: Exercise) {
        this.db.collection('finishedExercises').add(exercise);
    }
}