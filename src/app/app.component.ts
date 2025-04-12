import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
interface Trip {
  from: string;
  to: string;
  type: 'normal' | 'arrow' | 'curve';
  level: number;
  connected?: boolean;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Trip Connector';
  
  tripForm!: FormGroup;
  processedTrips: Trip[] = [];
  
  constructor(private fb: FormBuilder) {
    this.initForm();
  }
  
  initForm() {
    this.tripForm = this.fb.group({
      trips: this.fb.array([this.createTripFormGroup()])
    });
  }
  
  get tripFormArray() {
    return this.tripForm.get('trips') as FormArray;
  }
  
  createTripFormGroup(): FormGroup {
    return this.fb.group({
      from: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      to: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]]
    });
  }
  
  addTripForm() {
    this.tripFormArray.push(this.createTripFormGroup());
  }
  
  removeTripForm(index: number) {
    if (this.tripFormArray.length > 1) {
      this.tripFormArray.removeAt(index);
    }
  }
  
  submitTrips() {
    if (this.tripForm.valid) {
      const rawTrips = this.tripFormArray.value;
      this.processTrips(rawTrips);
    }
  }
  
  processTrips(rawTrips: any[]) {

    this.processedTrips = [];
    
    // Process all trips
    for (let i = 0; i < rawTrips.length; i++) {
      const current = rawTrips[i];
      
      current.from = current.from.toUpperCase();
      current.to = current.to.toUpperCase();
      
      // First trip always goes on level 1 with normal tpye
      if (i === 0) {
        this.processedTrips.push({
          from: current.from,
          to: current.to,
          type: 'normal',
          level: 1,
          connected: false
        });
        continue;
      }
      
      const previous = rawTrips[i - 1];
      const previousProcessed = this.processedTrips[i - 1];
      
      // Check if this is a contniued trip (previous.to === current.from)
      if (previous.to === current.from) {
        // it's a continued trip - straight line on the same level as previous
        this.processedTrips.push({
          from: current.from,
          to: current.to,
          type: 'normal',
          level: previousProcessed.level,
          connected: true
        });
      } 
      // Check if this is a duplicate route (same from-to as any previous trip)
      else {
        // Find any trip with the same route
        let existingRouteLevel = 0;
        
        for (const trip of this.processedTrips) {
          if (trip.from === current.from && trip.to === current.to) {
            // Found a trip with the same route, use a level higher than that
            existingRouteLevel = Math.max(existingRouteLevel, trip.level);
          }
        }
        
        if (existingRouteLevel > 0) {
          // It's a duplicate - place one level higher than existing
          this.processedTrips.push({
            from: current.from,
            to: current.to,
            type: 'normal',
            level: existingRouteLevel + 1,
            connected: false
          });
        } else {
          // Not continued and not duplicate - use curve on level 2
          this.processedTrips.push({
            from: current.from,
            to: current.to,
            type: 'curve',
            level: 2,
            connected: false
          });
        }
      }
    }
  }

  getTripsForLevel(level: number): Trip[] {
    return this.processedTrips.filter(trip => trip.level === level);
  }
  
  // Get all levels in the current trip set
  getLevels(): number[] {
    const levels = new Set<number>();
    this.processedTrips.forEach(trip => levels.add(trip.level));
    return Array.from(levels).sort();
  }
  
  getTripLabel(trip: Trip): string {
    return `${trip.from} - ${trip.to}`;
  }
  
  resetForm() {
    this.initForm();
    this.processedTrips = [];
  }
}