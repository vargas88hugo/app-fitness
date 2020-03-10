import { Exercise } from './exercise.model';
import { Subject, Subscription } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import 'firebase/firestore';
import { UIService } from '../shared/ui.service';

@Injectable()
export class TrainingService {
    exerciseChanged = new Subject<Exercise>();
    exercisesChanged = new Subject<Exercise[]>();
    finishedExercisesChanged = new Subject<Exercise[]>();
    private availableExercises: Exercise[] = [];
    private runningExercise: Exercise;
    private exerciseCollection: AngularFirestoreCollection<Exercise>
    private fireSubscription: Subscription[] = []; 

    constructor(
        private db: AngularFirestore,
        private uiService: UIService
        ) {}

    fetchAvailableExercises() {
        this.exerciseCollection = this.db.collection<Exercise>('availableExercises');

        this.uiService.loadingStateChanged.next(true);
        this.fireSubscription.push(this.exerciseCollection.snapshotChanges()
        .pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data() as Exercise;
                const id = a.payload.doc.id;
                return { id, ...data }
            }))
        )
        .subscribe((exercises: Exercise[]) => {
            this.uiService.loadingStateChanged.next(false);
            this.availableExercises = exercises;
            this.exercisesChanged.next([...this.availableExercises]);
        }, error => {
            this.uiService.loadingStateChanged.next(false);
            this.uiService.showSnackBar('Fetching Exercises Failed', null, 3000);
            this.exerciseChanged.next(null);
        }));
    }

    getAvailableExercises() {
        return this.availableExercises.slice();
    }

    startExercise(selectedId: string) {
        // this.db.doc('availableExercises/' + selectedId).update({lastSelected: new Date()})

        this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
        this.exerciseChanged.next({...this.runningExercise});
    }

    completeExercise() {
        this.addDataToDatabase({
            ...this.runningExercise, 
            date: new Date(), 
            state: 'completed'
        });
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }

    cancelExercise(progress: number) {
        this.addDataToDatabase({
            ...this.runningExercise,
            duration: this.runningExercise.duration * (progress / 100),
            calories: this.runningExercise.calories * (progress / 100),
            date: new Date(), 
            state: 'cancelled'
        });
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }

    getRunningExercise() {
        return {...this.runningExercise};
    }

    fetchCompletedOrCancelledExercise() {
        this.fireSubscription.push(this.db.collection('finishedExercises').valueChanges().subscribe(
            (exercises: Exercise[]) => {
                this.finishedExercisesChanged.next(exercises);
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