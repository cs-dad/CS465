import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Trip } from '../../models/trip';

@Injectable({
  providedIn: 'root'
})
export class TripData {

  constructor(private http: HttpClient) { }

  getTrips(): Observable<Trip[]> {
    let url = "https://cs465.csdad.us/api/trips";

    return this.http.get<Trip[]>(url);
  }

  addTrip(formData: Trip) : Observable<Trip> {
    let url = "https://cs465.csdad.us/api/trips/add";
    return this.http.post<Trip>(url, formData);
  }

  getTrip(tripCode: string) : Observable<Trip> {
    let url = `https://cs465.csdad.us/api/trips/${tripCode}`;
    return this.http.get<Trip>(url);
  }

  updateTrip(formData: Trip) : Observable<Trip> {
    let url = `https://cs465.csdad.us/api/trips/${formData.code}`;
    return this.http.put<Trip>(url, formData);
  }
  
}
