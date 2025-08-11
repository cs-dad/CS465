import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { trips } from '../data/trips'; 

import { TripCard } from '../trip-card/trip-card';
import { Trip } from '../../models/trip'; 
import { TripData } from '../services/trip-data';

import { Router } from '@angular/router';


@Component({
  selector: 'app-trip-listing',
  standalone: true,
  imports: [CommonModule, TripCard],
  templateUrl: './trip-listing.html',
  styleUrl: './trip-listing.css',
  providers: [TripData]
})
export class TripListing implements OnInit {

  trips: Array<any> = trips;
  message: string = 'Loading trips...';

  constructor(private tripData: TripData, private router: Router) {
    console.log('trip-listing constructor init');
  }

  public addTrip(): void {
    this.router.navigate(['add-trip']);
  }


  private getTrips(): void {
    this.tripData.getTrips().subscribe({
      next: (value: Trip[]) => {
        this.trips = value;
        this.message = value.length
          ? `There are ${value.length} trips available.`
          : 'There were no trips retrieved from the database';
        console.log(this.message);
      },
      error: (err: unknown) => {
        console.error('Error:', err);
      }
    });
  }

  private editTrip(trip: Trip): void {
    localStorage.removeItem('tripCode');
    localStorage.setItem('tripCode', trip.code);
    this.router.navigate(['edit-trip']);
  }


  ngOnInit(): void {
    console.log('ngOnInit - trip-listing');
    this.getTrips();
  }

}

