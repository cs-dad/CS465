import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { TripData } from '../services/trip-data';
import { Trip } from '../../models/trip';

@Component({
  selector: 'app-edit-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-trip.html',
  styleUrl: './edit-trip.css'
})
export class EditTrip implements OnInit {
  
  public editForm!: FormGroup;
  trip!: Trip;
  submitted = false;
  message : string = '';

  constructor(private formBuilder: FormBuilder, private router: Router, private tripData: TripData) {

  }

  ngOnInit() : void {

    // retrieve the trip code from local storage
    const tripCode = localStorage.getItem('tripCode');

    if(!tripCode) {
      alert("Could not find stashed trip.");
      this.router.navigate(['']);
      return;
    }

    this.editForm = this.formBuilder.group({
      _id: [],
      code: ['', Validators.required],
      name: ['', Validators.required],
      length: ['', Validators.required],
      start: ['', Validators.required],
      resort: ['', Validators.required],
      perPerson: ['', Validators.required],
      image: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.tripData.getTrip(tripCode).subscribe({
      next: (data: any) => {
        this.trip = data;

        const startForInput = this.toDateInputString(this.trip.start);
        this.editForm.patchValue({
          ...this.trip,
          start: startForInput
        });

        if(!this.trip) {
          this.message = `Trip with code ${tripCode} not found.`;
        } else {
          this.message = `Trip with code ${tripCode} found.`;
        }
      },
      error: (error: any) => {
        console.error('Error fetching trip:', error);
      }
    });

  }

  // method to convert Date to input string format (YYYY-MM-DD), allowing the frontend to load the date correctly
  private toDateInputString(date: Date | string) : string {
    const dt = new Date(date);

    if(isNaN(dt.getTime())) return '';

    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(dt.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public onSubmit(): void {

    this.submitted = true;

    if (this.editForm.invalid) {
      return;
    }

    if (this.editForm.valid) {
      this.tripData.updateTrip(this.editForm.value).subscribe({
        next: (data: any) => {
          console.log(data);
          this.router.navigate(['']);
        },
        error: (error: any) => {
          console.error('Error updating trip:', error);
        }
      })
    }
  }

  get f() { return this.editForm.controls; }
}
