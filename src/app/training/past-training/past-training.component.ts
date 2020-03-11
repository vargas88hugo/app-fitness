import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material'; 
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import { Exercise } from '../exercise.model';
import { TrainingService } from '../training.service';
import * as fromTraining from '../training.reducer';

@Component({
  selector: 'app-past-training',
  templateUrl: './past-training.component.html',
  styleUrls: ['./past-training.component.scss']
})
export class PastTrainingComponent
  implements OnInit, AfterViewInit {
  displayedColumns = ['date', 'name', 'duration', 'calories', 'state'];
  dataSource = new MatTableDataSource<Exercise>();

  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  constructor(
    private trainingService: TrainingService,
    private store: Store<fromTraining.State>
  ) {}

  ngOnInit() {
    this.store.select(fromTraining.getFinishedExercises).subscribe(
      (exercises: Exercise[]) => {
        this.dataSource.data = exercises;
      }
    );
    this.trainingService.fetchCompletedOrCancelledExercise();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}